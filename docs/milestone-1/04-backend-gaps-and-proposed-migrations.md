# 04 — Missing backend capabilities and proposed migrations

Nothing in this document has been applied. Each item is a proposal for review. All proposals are **additive** (new RPCs, triggers, policies, buckets, nullable columns or new tables). None rewrites existing tables, and none changes client-visible behavior except closing the security holes in `03`.

Migrations would live in the shared `kiburan/supabase/migrations/` folder (the only migration history for the shared project), prefixed `vendor_`, and must ship together with regenerated `database.types.ts` for both apps.

## 1. Capability matrix

| Feature area | Backend today | Gap |
| --- | --- | --- |
| Vendor sign-up / sign-in | Shared Supabase Auth, password + email OTP | Vendor deep-link scheme must be added to redirect allow list |
| Vendor onboarding (create business) | Direct INSERT allowed | S1: self-verification. Needs `create_vendor` RPC + insert guard |
| Submit for approval | Not possible from client | Needs `submit_vendor_for_verification` RPC |
| Admin approval | Service role / SQL only | **Out of scope for vendor app.** Document an operator procedure; an admin tool is a separate product decision |
| Business profile | `vendors` columns | No service areas, experience, rejection reason. Logo/cover have no bucket |
| Categories | `vendor_category_memberships` | Seeded list has no "Decoration" (design uses it). Categories are reference data — adding rows is a data change, not schema |
| Services | `vendor_services` full CRUD for owner/manager | No `updated_at`, no `sort_order`; images need bucket |
| Packages | `vendor_packages` CRUD | Fine |
| Portfolio / media | `vendor_media` table | **No storage bucket** |
| Availability | `vendor_availability` ranges | No overlap guard, no link to bookings |
| Inquiries — read | Yes | Cannot see couple names / event / customer name (RLS). Needs read RPC |
| Inquiries — respond | Only by changing `status` | No reply text / thread. Needs messages (see below) or at minimum a vendor response column |
| Quotes | Table + permissive RLS | S5; client never creates quotes. Needs `send_quote` RPC and couple-side acceptance flow (client app change) |
| Bookings | Table exists; **client never creates bookings** | No booking-request source. Needs quote-acceptance → booking RPC (couple side) and vendor accept/decline/fulfil RPCs |
| Booking history | None | No status history / `updated_at` |
| Messages | **None** | No tables, no realtime publication |
| Notifications | **None** (see `kiburan/docs/notifications-proposal.md`) | No tables, no push tokens, no `expo-notifications` |
| Earnings | Only agreed `total_amount` / `deposit_amount` on bookings | No vendor-visible payment records. "Payments received" and "outstanding balance" cannot be shown truthfully |
| Reviews | Read-only for vendor | No moderation path (reviews stay `pending` unless service role publishes). No vendor reply |
| Team management | Direct row insert by owner/manager | S6; no invitation/consent flow; no per-permission model |
| Dashboard metrics | Derivable from tables | Better as one `vendor_dashboard_summary` RPC to avoid N round trips and RLS cost |

## 2. Proposed migrations, in priority order

### P1 — Security hardening (blocking; must land before the vendor app goes to any real user)

1. **Guard vendor INSERT**: extend `private.protect_vendor_verification()` to `BEFORE INSERT OR UPDATE` and force `verification_status = 'unverified'` and `listing_status = 'draft'` on client inserts. Fixes S1.
2. **Column-scoped vendor writes on couple tables**: replace the vendor-team clause in `wedding_vendors_update`, `vendor_inquiries_update`, and `vendor_bookings_update` with RPC-only access for vendors. Concretely: drop `or is_vendor_team_member(...)` from those UPDATE policies, and expose the vendor operations as `SECURITY DEFINER` RPCs (P3). Fixes S2, S3, S4, S7 (for writes).
3. **Quote integrity**: `vendor_quotes` INSERT restricted to `status in ('draft','sent')`; couple-side UPDATE limited to `status` (`accepted`/`rejected`) via RPC; `inquiry_id`, `amount`, `package_id` immutable after `sent`. Add trigger: `vendor_bookings.quote_id`'s vendor must equal the booking's vendor. Fixes S5.
4. **Owner protection**: trigger on `vendors` blocking change of `owner_user_id` unless `auth.uid() = old.owner_user_id`; block `listing_status` change *from* `suspended` by clients; trigger on `vendor_team_members` preventing non-owners from inserting/updating role `owner` or removing the owner. Fixes S6.
5. **Status transition trigger** on `vendor_bookings`: allowed `pending → confirmed | cancelled`, `confirmed → fulfilled | cancelled`; terminal states immutable.

### P2 — Vendor-scoped read RPCs (unblocks inquiry and booking screens)

- `vendor_list_inquiries(p_vendor_id, p_status, p_limit, p_cursor)` and `vendor_get_inquiry(p_inquiry_id)` returning inquiry columns plus a **minimal** couple projection: wedding title, partner first names, `celebration_kind`, `wedding_date`, `city`, requested event name/start/venue, inquirer display name. Contact phone/email only after a booking is `confirmed` (product decision — see open questions).
- `vendor_list_bookings(...)` / `vendor_get_booking(p_booking_id)` with the same projection plus booking fields and service title.
- `vendor_dashboard_summary(p_vendor_id)` returning counts (new inquiries, pending / upcoming / confirmed / fulfilled bookings), published-review average and count, and booking-value totals (see P6).

All RPCs: `SECURITY DEFINER`, `search_path = ''`, first statement asserts `private.is_vendor_team_member(p_vendor_id)`.

### P3 — Vendor workflow RPCs

| RPC | Allowed roles | Effect |
| --- | --- | --- |
| `create_vendor(business_name, category_ids, city, …)` | any authenticated | Generates unique slug, inserts vendor as `unverified`/`draft`, inserts owner team row, category memberships — atomically |
| `submit_vendor_for_verification(vendor_id)` | owner | `unverified`/`rejected → pending` after completeness checks |
| `vendor_update_inquiry_status(inquiry_id, status)` | owner/manager/staff | `new → replied/declined/closed` only |
| `vendor_send_quote(inquiry_id, amount, package_id, description, valid_until)` | owner/manager | Inserts `sent` quote, sets inquiry `quoted` |
| `vendor_respond_booking(booking_id, action, note)` | owner/manager | `confirm` / `decline` (→ `cancelled`) / `fulfil`; sets `wedding_vendors.status` accordingly; on confirm optionally inserts `vendor_availability` `booked` window |

Couple-side counterpart (requires a coordinated **client app** change, documented not done): `accept_vendor_quote(quote_id)` creating `vendor_bookings` (`pending`) and moving `wedding_vendors.status` to `negotiating`/`booked`. Without this, the vendor Bookings tab will be empty for real users.

### P4 — Storage

| Bucket | Public | Path | Write | Read |
| --- | --- | --- | --- | --- |
| `vendor-public` | yes | `{vendor_id}/logo.*`, `{vendor_id}/cover.*`, `{vendor_id}/media/{media_id}.*` | `can_manage_vendor(first folder)` | public (only referenced from published listings; draft vendors' images are guessable-URL-only — acceptable for marketing images, confirm with PM) |
| `vendor-private` | no | `{vendor_id}/contracts/{booking_id}/{file}` | `can_manage_vendor` | vendor team + members of the booking's wedding (via helper) |

5 MiB images (jpeg/png/webp) for public; 20 MiB pdf/images for contracts. The client marketplace must then render `vendor_media.storage_path` as a storage path (currently it only renders `https://` values) — a small coordinated client change.

### P5 — Messaging (only if approved)

Minimal design: `vendor_conversations (id, vendor_id, wedding_id, inquiry_id unique nullable, created_at, last_message_at)` + `vendor_messages (id, conversation_id, sender_id, body, created_at)` + `vendor_conversation_reads (conversation_id, user_id, last_read_at)`. RLS: vendor team of `vendor_id` or wedding members with `vendors.inquiries.manage`. Add both message tables to the `supabase_realtime` publication. The couple app needs a matching UI for messages to be delivered to anyone — **otherwise vendor messages would go nowhere**, so vendor-side Messages must stay hidden until both sides ship.

### P6 — Earnings (honest version that needs no new tables)

Report only from `vendor_bookings`:

| Label shown | Source |
| --- | --- |
| Pipeline value | `total_amount` where `pending` |
| Confirmed booking value | `total_amount` where `confirmed` |
| Completed booking value | `total_amount` where `fulfilled` |
| Agreed deposits | `deposit_amount` (agreed, **not** received) |

"Payments received" and "outstanding balance" require a vendor-confirmed payment ledger (e.g. `vendor_booking_payments` recorded or acknowledged by the vendor). The couple's `expense_payments` are self-reported budget entries and must not be presented as vendor revenue. Proposal deferred until product decides on payments (Chapa / Telebirr integration is a separate project).

### P7 — Notifications

Reuse `kiburan/docs/notifications-proposal.md` (`notifications`, `device_push_tokens`, `notification_preferences`) with category `vendor` and triggers on new inquiry, quote accepted, booking created/cancelled, review published. Shared by both apps.

### P8 — Team invitations

`vendor_team_invites` mirroring the wedding invite pattern (hashed token, email, role, expiry, revoke) + `accept_vendor_team_invite` RPC, so membership requires invitee consent. Until then the vendor app should only show the team list read-only plus owner-side removal.

### P9 — Indexes and audit columns

Indexes listed in `01` ("Missing for vendor-side access paths"). Nullable `updated_at` on `vendor_inquiries`, `vendor_quotes`, `vendor_bookings`, `vendor_services` with the existing `private.set_updated_at()` trigger. Optional `vendor_booking_status_history`.

## 3. Early design-vs-backend notes (from the uploaded board)

A vendor design board (8 phone screens) was attached with this task. Full screen-by-screen analysis is deferred to the next step as requested; these are only the backend conflicts already visible:

| Design element | Backend reality |
| --- | --- |
| Dashboard "This Month Revenue ETB 245,000 ↑12%" | No payment data. Can show "Confirmed booking value" (P6) with honest label, or hide |
| Booking card "Tsehay & Daniel", "Skylight Convention Center", time | Needs P2 read RPC (vendor cannot read weddings/events) |
| Booking statuses Pending / Confirmed / In Progress / Completed | DB has `pending/confirmed/fulfilled/cancelled`. "In Progress" has no column — derive from `confirmed` + `start_at <= now() <= end_at`, or drop |
| "View Contract" | No bucket (P4) and nothing populates `contract_storage_path` |
| "Contact Client" | Requires a decision on exposing couple contact info (P2) |
| Messages tab with unread badges | No messaging backend (P5) |
| Notification bell with dot | No notifications backend (P7) |
| Profile stats "120+ Clients", "2 Years Experience" | No experience column; client count derivable from distinct weddings with fulfilled bookings |
| "Business Verified" / "Verified Vendor" badge | Supported by `verification_status = 'verified'` |
| Add Service: photos, name, category, description, starting price | Supported (`vendor_services` + `vendor_media.service_id`) once P4 exists. Category "Decoration" is not seeded |
| Services filter Active / Inactive | Supported (`is_active`) |
| "Earnings & Payouts" menu | No payouts backend |

## 4. Open questions for you / PM

1. Who approves vendors, and how (Supabase dashboard by staff, or a future admin app)? Approve the P1 insert guard regardless.
2. When may a vendor see the couple's phone/email — at inquiry, at quote, or only after booking confirmation?
3. Should messaging be built now (P5, needs client-app UI too) or should "Messages" be hidden for v1?
4. Is a vendor-confirmed payment ledger in scope for v1, or do we ship with booking-value metrics only?
5. Should staff be able to send quotes, or only owner/manager?
6. Approve adding "Decoration" (and any other) categories to `vendor_categories` in production data.
7. Approve the coordinated client-app changes: quote acceptance → booking creation, and rendering storage-path media.
