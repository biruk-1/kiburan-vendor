# 02 — Existing vendor backend functionality and authentication architecture

## 1. Environment

| Item | Value |
| --- | --- |
| OS | Windows 11 (PowerShell) |
| Node / npm | v24.18.0 / 10.9.8 |
| Client app | `kiburan/` — Expo SDK 58, React Native 0.88, React 19.3, Expo Router 58, TypeScript 6, `@supabase/supabase-js` 2.118, TanStack Query 5, Zod 4, Vitest |
| Not used by client | Zustand, React Hook Form |
| Supabase | Local CLI stack running in Docker (`supabase_*_kiburan` containers). `.env` points at `http://127.0.0.1:54321`. No hosted project URL is configured in the repo. |
| Edge Functions | None (`supabase/functions` does not exist) |
| Realtime | Container runs, but no table is added to a realtime publication by any migration |
| Git | `kiburan/` is a git repo with many uncommitted client changes. The workspace root is not a repo. |

The vendor app must point at the **same** Supabase URL and anon key as the client. Locally that is the CLI stack above; production will be whatever hosted project the client ships against.

## 2. What the client app does with vendor data today

`kiburan/src/features/vendors/services/vendorService.ts` is the only vendor data layer. It is entirely couple-facing:

| Function | Tables | Behavior |
| --- | --- | --- |
| `listVendorCategories` | `vendor_categories` | Chip list |
| `listPublishedVendors` | `vendors` + `vendor_category_memberships`, `vendor_services` | Published + verified vendors, starting price computed client-side |
| `getVendorProfile` | `vendors`, `vendor_services`, `vendor_packages`, `vendor_media`, `vendor_availability` (next 12 windows), `vendor_reviews` (published, joined to `profiles.display_name`) | Public profile |
| `saveVendorToWedding` / `removeVendorFromWedding` | `wedding_vendors` | Shortlist (`status = 'shortlisted'`) |
| `createVendorInquiry` | `vendor_inquiries` | Insert with `status = 'new'`, `created_by = auth.uid()` |

Other client touch points:

- `timelineService.ts` reads `vendor_bookings (id, status, booking_date, start_at, end_at, notes)` nested under `wedding_vendors` for display.
- `budgetService.ts` can set `budget_items.booking_id`; `documentService.ts` can set `wedding_files.booking_id`.

**The client never creates `vendor_quotes` or `vendor_bookings`.** There is no code path that turns an inquiry into a quote or a booking, and nothing writes `vendor_reviews` from the UI. On a real database today, a vendor would therefore see inquiries and nothing else in the commercial pipeline.

`kiburan/docs/vendors.md` explicitly lists as deferred: vendor admin / listing management, quotes, bookings, payments, chat, private storage URL signing.

## 3. Server-side functions available to vendors

| Function | Kind | Purpose |
| --- | --- | --- |
| `private.is_vendor_team_member(vendor_id)` | SECURITY DEFINER helper | Owner (`vendors.owner_user_id`) **or** any `vendor_team_members` row (any role) |
| `private.can_manage_vendor(vendor_id)` | SECURITY DEFINER helper | Owner **or** team role `owner` / `manager` |
| `private.is_public_vendor(vendor_id)` | SECURITY DEFINER helper | `published` + `verified` |
| `private.protect_vendor_verification()` | Trigger | Blocks client UPDATE of `verification_status` |

There are **no public vendor RPCs**: no create-vendor, submit-for-verification, invite-team-member, respond-to-inquiry, send-quote, accept/decline booking, dashboard summary, or earnings summary. All existing RPCs (`create_wedding`, team invites, guest RPCs, `get_budget_summary`, etc.) are wedding-side.

## 4. Authentication architecture (shared)

Both apps share one `auth.users` pool, so one email = one Kiburan identity across both apps.

| Capability | Status in backend / client |
| --- | --- |
| Email + password sign-up | Supported (`supabase.auth.signUp`, `display_name` in user metadata) |
| Email + password sign-in | Supported |
| Email OTP (passwordless) | Supported. Client uses `signInWithOtp` + `verifyOtp` for team invites (`docs/planning-team/18-passwordless-invite-auth.md`). Local OTP mail goes to Mailpit `:54324`. Hosted project must enable Email OTP manually. |
| Email confirmation | **Disabled locally** (`enable_confirmations = false` in `config.toml`). Hosted setting unknown. |
| Password reset | Supported (deep link `kiburan://reset-password`) |
| Session storage | AsyncStorage wrapper (`src/lib/authStorage.ts`), PKCE flow, auto refresh |
| Profile row | Auto-created by `on_auth_user_created` trigger |
| Deep links / redirect URLs | `site_url = kiburan://` and `additional_redirect_urls` for `kiburan://**`. **The vendor app needs its own scheme (e.g. `kiburan-vendor://`) added to the allow list** in both local `config.toml` and the hosted dashboard. That is a shared-config change, not a client code change. |
| Phone / SMS auth | Not configured |
| Social auth | Not configured |

## 5. Vendor account architecture

There is no vendor "account" separate from the user. A user is a vendor operator if and only if:

1. `vendors.owner_user_id = auth.uid()` for some vendor, **or**
2. a `vendor_team_members` row exists with `user_id = auth.uid()`.

A user can operate several vendors (the seed owner owns four). The vendor app therefore needs an **active business selector**, persisted per user.

### Mapping the requested account states to real data

| Requested state | How to detect with the current schema | Supported? |
| --- | --- | --- |
| No vendor business | No owned vendor and no team row | Yes |
| Started onboarding | Owned vendor with `listing_status = 'draft'` and `verification_status = 'unverified'` | Yes (onboarding progress itself is not stored; completeness must be derived from filled fields / child rows) |
| Submitted, awaiting approval | `verification_status = 'pending'` | **Partially.** A client cannot move `unverified → pending` because the trigger blocks every UPDATE of that column. (It *can* set any value at INSERT — see security finding S1.) Needs a `submit_vendor_for_verification` RPC. |
| Approved and active | `verification_status = 'verified'` and `listing_status = 'published'` | Yes, but approval can only be done with the service role / SQL. There is no admin model or admin tool. |
| Verified but unpublished | `verified` + `draft` | Yes — vendor can publish themselves via UPDATE of `listing_status` |
| Rejected | `verification_status = 'rejected'` | Detectable; no rejection reason column |
| Suspended | `listing_status = 'suspended'` | Detectable, but nothing stops a manager from un-suspending (security finding S6) |
| Invited to an existing business | No invite table | **Not supported.** A manager can only insert a `vendor_team_members` row directly for a known `user_id`, without the invitee's consent. The user would simply appear as a member on next login. |

### Role capabilities (as enforced by RLS today)

| Capability | Owner | Manager | Staff |
| --- | --- | --- | --- |
| Read own vendor (any listing state), services, packages, media, availability, categories, team, all reviews | ✓ | ✓ | ✓ |
| Edit business profile, services, packages, media, availability, categories | ✓ | ✓ | ✗ |
| Add / change / remove team members | ✓ | ✓ (including other owners — S6) | ✗ |
| Read and update inquiries, quotes, bookings, couple's `wedding_vendors` row | ✓ | ✓ | ✓ (every column — S2/S3) |
| Change `owner_user_id` | ✓ | ✓ (S6) | ✗ |
| Change `verification_status` | ✗ | ✗ | ✗ |

There is no finer-grained vendor permission model (nothing like the wedding-side `wedding_permission_catalog`).
