# Milestone 5 — Dashboard + business profile

Status: **complete, waiting for review.** Milestone 6 has not been started.

This milestone wires real dashboard metrics through **P2** (`vendor_dashboard_summary`) and adds business profile editing with logo / cover / portfolio uploads through **P4** (`vendor-public` / `vendor-private` storage).

## 1. Shared backend (in `kiburan/supabase`)

Migrations applied locally:

| Migration | Purpose |
| --- | --- |
| `20261110130000_vendor_p2_summary_p4_storage.sql` | `vendor_dashboard_summary` RPC + `vendor-public` / `vendor-private` buckets and RLS |
| `20261110130100_vendor_dashboard_summary_fix.sql` | Renames a PL/pgSQL loop variable that collided with a `vendor_reviews` alias |

SQL check: `kiburan/supabase/tests/vendor_dashboard_summary.sql` (rolls back; reports `vendor_dashboard_summary ok`).

### RPC: `vendor_dashboard_summary(p_vendor_id)`

Team-member only. Returns:

- inquiry / booking status counts (`new_inquiries`, `pending_bookings`, `confirmed_bookings`, `fulfilled_bookings`, `cancelled_bookings`, `active_bookings`)
- published review count + average
- ETB booking-value this month / last month / 6-month series
- `has_other_currencies` when non-ETB confirmed/fulfilled bookings exist (excluded from totals)

### Storage

| Bucket | Public | Limit | Used in M5 |
| --- | --- | --- | --- |
| `vendor-public` | yes | 5 MiB jpeg/png/webp | logo, cover, portfolio |
| `vendor-private` | no | 20 MiB | reserved for contracts (not wired in the app yet) |

Object keys are `{vendorId}/{kind}/…` so RLS can call `private.can_manage_vendor` on the first folder segment.

**Client compatibility:** uploaded `logo_url`, `cover_url`, and `vendor_media.storage_path` store the **public HTTPS URL**, not a bare storage path, so the client marketplace `resolveMediaUrl` (https-only) keeps working without a coordinated client change.

Vendor app types regenerated with `npm run db:types`.

## 2. Vendor app

### Dashboard

- Counts, rating, and booking-value series come from `vendor_dashboard_summary` (one round trip).
- Recent activity remains light list queries (RPC does not include an activity feed).
- Standing banner now also covers **verified but unpublished** with Publish / Edit profile actions.

### Profile tab

| Screen | Route | Notes |
| --- | --- | --- |
| Profile hub | `/profile` | Menu opens Business Profile, Portfolio, Business Settings |
| Business Profile | `/profile/business` | Edit name, categories, city, description, contact, links; upload logo & cover (managers+) |
| Portfolio | `/profile/media` | Add / remove business portfolio images (`vendor_media` with `service_id` null) |
| Business Settings | `/profile/settings` | Marketplace status; publish / unpublish when verified (cannot leave `suspended`) |

Images are resized to ≤ 1600 px before upload via `expo-image-manipulator`.

## 3. Verification

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npx eslint src` | clean |
| `npx vitest run` | 61 tests |
| SQL `vendor_dashboard_summary` | ok |
| Web smoke (`SMOKE_BASE=… node ./scripts/smoke-m5.mjs`) | seed sign-in → dashboard metrics → profile → business / portfolio / settings; no console errors |

Screenshots: [`screenshots/`](screenshots/).

Seed login: `marketplace.seed@kiburan.local` / `SeedVendorPass1`.

## 4. Gaps (documented, not invented)

- `vendor-private` exists but contracts / “View Contract” are not in the app yet (needs data + M7 booking detail work).
- Service photo upload still waits for Milestone 6.
- Inquiry / booking couple identity still needs the remaining P2 read RPCs (Milestone 7).
- Orphaned replaced images in storage are best-effort deleted; no garbage-collection job.

## 5. Not in this milestone

- Services / packages / availability CRUD polish (Milestone 6)
- Inquiry / booking / quote workflow RPCs (Milestone 7)
- Messaging, earnings ledger, team invites
