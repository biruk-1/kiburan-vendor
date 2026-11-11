# 03 — RLS, security findings, and storage

RLS is enabled on every `public` table (`20260325120300_rls_policies.sql`). Vendor-side policies were not modified by later migrations, except that `20261106120100_team_permission_rls.sql` re-created `wedding_vendors`, `vendor_inquiries`, and `vendor_bookings` policies to tighten the **wedding** side while keeping the vendor-team clauses identical.

## 1. Current vendor-relevant policies

| Table | SELECT | INSERT | UPDATE | DELETE |
| --- | --- | --- | --- | --- |
| `vendors` | public+verified, or team member | `owner_user_id = auth.uid()` | `can_manage_vendor` | none |
| `vendor_team_members` | team member | `can_manage_vendor` | `can_manage_vendor` | `can_manage_vendor` |
| `vendor_category_memberships` | public vendor or team | `can_manage_vendor` (ALL) | same | same |
| `vendor_services` | active+public, or team | `can_manage_vendor` (ALL) | same | same |
| `vendor_packages` | active+public, or team | `can_manage_vendor` via service (ALL) | same | same |
| `vendor_media` | public vendor or team | `can_manage_vendor` (ALL) | same | same |
| `vendor_availability` | public vendor or team | `can_manage_vendor` (ALL) | same | same |
| `wedding_vendors` | wedding `vendors.view` **or** vendor team | wedding `vendors.manage` | wedding `vendors.manage` **or vendor team** | wedding `vendors.manage` |
| `vendor_inquiries` | vendor team or wedding permissions | wedding `vendors.inquiries.manage` | **vendor team** or wedding | none |
| `vendor_quotes` | vendor team or wedding member | **vendor team** | vendor team **or** wedding writer | none |
| `vendor_bookings` | vendor team or wedding `budget.expenses.view` | wedding `vendors.manage` + `budget.expenses.create` | **vendor team** or wedding | none |
| `vendor_reviews` | published, or wedding member / vendor team / reviewer | reviewer + wedding writer, `status = 'pending'` | reviewer while pending | none |
| `profiles` | self, wedding peers, vendor team peers, owners of vendors I belong to | — | self | — |
| `weddings`, `wedding_events` | wedding members / permission only | — | — | — |
| `expense_payments`, `budget_items` | wedding members only | — | — | — |

Positive points: vendors cannot modify reviews; vendors cannot change `verification_status` by UPDATE; draft vendors are hidden from outsiders; service-role key is not shipped (`src/lib/supabase.ts` uses anon key only, `.env.example` warns against it); helpers are `SECURITY DEFINER` with `search_path = ''`.

## 2. Verified security findings

Findings S1–S4 were **executed** against the local database on 2026-11-06 inside a transaction that was rolled back (impersonating the seeded vendor owner and a fresh user via `request.jwt.claims` + `set role authenticated`). Raw result:

```
vendor can read own inquiry rows: 1
vendor can read linked wedding row: 0
vendor can read inquiring customer profile: 0
vendor rewrote customer inquiry message (rows): 1
vendor moved inquiry into unrelated wedding (rows): 1
vendor moved wedding_vendors row into unrelated wedding (rows): 1
new user inserted vendor as verified+published: SUCCEEDED
```

S5–S9 are from policy reading and were not executed.

| ID | Severity | Finding | Why |
| --- | --- | --- | --- |
| **S1** | Critical | Any authenticated user can create a vendor that is already `verified` + `published` and appears in the marketplace immediately. | `vendors_insert_owner` only checks `owner_user_id`; `vendors_protect_verification` fires on `UPDATE` only. |
| **S2** | Critical | Any vendor team member (including `staff`) can move a couple's `wedding_vendors` row into **any other wedding** and write its `notes`. The target couple would then see a vendor link they never created. | `wedding_vendors_update` WITH CHECK accepts `is_vendor_team_member(vendor_id)` with no column restriction; `wedding_id` is mutable. |
| **S3** | High | Any vendor team member can rewrite a customer's inquiry (`message`, `proposed_budget`, `created_by`) and move it into another wedding. | Same pattern on `vendor_inquiries_update`. |
| **S4** | High | Vendor can update every `vendor_bookings` column: arbitrary status jumps (`pending → fulfilled`), amounts, and re-pointing `wedding_vendor_id` to another couple's link. No transition rules exist. Couple-side `budget_items.booking_id` integrity is only re-checked when the budget item changes. | `vendor_bookings_update` has no column or transition restriction. |
| S5 | High | `vendor_quotes`: vendor can insert with `status = 'accepted'`; the couple can edit the vendor's `amount`; either side can re-point `inquiry_id`. `vendor_bookings.quote_id` is not checked against the booking's vendor. | Unrestricted INSERT/UPDATE policies, no trigger. |
| S6 | High | A `manager` can change `vendors.owner_user_id` (ownership takeover), remove the owner's team row, promote anyone to `owner`, and un-suspend a suspended listing. Managers can add arbitrary users as members without consent. | `can_manage_vendor` covers owner and manager equally; no column guard on `owner_user_id` / `listing_status`. |
| S7 | Medium | Vendors read the couple's private `wedding_vendors.notes`. | Whole-row SELECT for vendor team. |
| S8 | Medium | Rating integrity: vendors can read `pending` and `hidden` reviews. Fine for display, but any rating metric must filter `status = 'published'` or it will disagree with the marketplace. | SELECT policy. |
| S9 | Low | Staff can read all team members and profiles of the team; acceptable, but there is no audit trail of vendor-side changes (no `updated_at` on inquiries/quotes/bookings). | Schema. |

### Functional gap caused by RLS (not a leak — a blocker)

Vendors **cannot read** the `weddings`, `wedding_events`, or customer `profiles` rows behind their own inquiries and bookings. So the vendor app cannot show the couple's names ("Tsehay & Daniel" in the design), the event date/venue from `requested_event_id`, or the customer's display name — only the raw UUIDs. This must be solved with a narrowly-scoped `SECURITY DEFINER` read RPC, **not** by widening `weddings` / `profiles` SELECT policies, which would expose whole private rows.

## 3. Storage configuration

| Bucket | Public | Size / types | Path convention | Write policy |
| --- | --- | --- | --- | --- |
| `wedding-documents` | private | 20 MiB, pdf/images/office/text | `{wedding_id}/{file_id}/{name}` | wedding document permissions |
| `avatars` | public | 5 MiB, jpeg/png/webp | `{user_id}/avatar.{ext}` | own folder only |
| `wedding-covers` | public | 5 MiB, jpeg/png/webp | `{wedding_id}/cover.{ext}` | wedding writers |

**There is no vendor bucket.** Consequences:

- `vendors.logo_url`, `vendors.cover_url`, `vendor_media.storage_path` are populated only by seed Unsplash URLs. Vendors cannot upload logos, covers, portfolio, or service photos today.
- `vendor_bookings.contract_storage_path` has no backing bucket ("View Contract" in the design cannot work).
- The vendor app **can** reuse `avatars` for the operator's personal profile picture (existing policy is correct for that).

Proposed buckets are in `04-backend-gaps-and-proposed-migrations.md`.

## 4. Security rules the vendor app will follow

1. Anon key only; one `createClient` instance; session in secure storage on device.
2. Never write directly to `vendor_inquiries`, `vendor_quotes`, `vendor_bookings`, or `wedding_vendors` once the proposed RPCs exist — status changes go through RPCs that check role and allowed transitions.
3. UI gating by role is a convenience; every action must also be enforced server-side.
4. Rating and revenue figures are computed server-side from published reviews and labelled booking values.
5. The vendor app's query cache is keyed by `userId` + `vendorId` and cleared on sign-out and on business switch.
