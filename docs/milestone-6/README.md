# Milestone 6 — Services, packages, availability

Status: **complete, waiting for review.** Milestone 7 has not been started.

This milestone finishes the service catalog surfaces: service photo uploads (using M5 `vendor-public` storage), packages CRUD, availability windows, and the reviewed **P9** shared-backend indexes / audit columns.

## 1. Shared backend (in `kiburan/supabase`)

Migration applied locally:

`migrations/20261111120000_vendor_p9_indexes_audit.sql`

| Change | Effect |
| --- | --- |
| `idx_wedding_vendors_vendor` | Faster vendor → bookings joins |
| `idx_vendor_bookings_wedding_vendor` | Booking list by wedding_vendor |
| `idx_vendor_quotes_inquiry` | Quotes by inquiry |
| `idx_vendor_media_vendor_sort` | Portfolio / service photo ordering |
| `idx_vendor_packages_service` | Packages by service |
| `idx_vendor_inquiries_vendor_created` | Inquiry feed by vendor |
| `updated_at` on `vendor_services`, `vendor_inquiries`, `vendor_quotes`, `vendor_bookings` | Nullable audit columns + `private.set_updated_at` triggers |

SQL check: `kiburan/supabase/tests/vendor_p9_indexes.sql` → `vendor_p9_indexes ok`.

Types regenerated in both apps with `npm run db:types`.

**Still documented gaps (not invented):** availability has no overlap exclusion and is not linked to bookings; booked windows are not auto-created from confirmed bookings.

## 2. Vendor app

### Services
- Add / Edit Service photo uploads via `vendor_media.service_id` (public HTTPS URLs).
- New-service flow can stage local picks and upload after insert.
- Service menu: Edit, **Packages**, Activate/Deactivate, Delete.
- Calendar icon → Availability.

### Packages
| Screen | Route |
| --- | --- |
| Package list | `/services/[serviceId]/packages` |
| Add package | `/services/[serviceId]/packages/new` |
| Edit package | `/services/[serviceId]/packages/[packageId]` |

Fields: name, ETB price (optional), description, inclusions (lines/commas), active toggle. Delete blocked with an honest message when quotes reference the package (`23503`).

### Availability
| Screen | Route |
| --- | --- |
| Windows list + form | `/services/availability` |

Also linked from Profile → Availability. Create / edit / delete windows with date, start/end time, status (`available` \| `unavailable` \| `tentative` \| `booked`), optional service, notes.

## 3. Verification

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npx eslint src` | clean |
| `npx vitest run` | 66 tests |
| SQL `vendor_p9_indexes` | ok |
| Web smoke (`SMOKE_BASE=… node ./scripts/smoke-m6.mjs`) | services → availability save → packages create → add-service upload UI |

Screenshots: [`screenshots/`](screenshots/).

Seed login: `marketplace.seed@kiburan.local` / `SeedVendorPass1`.

## 4. Not in this milestone

- Inquiry / booking / quote workflow RPCs (Milestone 7)
- Messaging, earnings ledger, team invites
- Auto-sync of availability from bookings
