# Milestone 7 — Inquiries, bookings, quotes

Status: **complete.** Milestone 8 (reviews & earnings) followed.

This milestone adds the remaining **P2** vendor read RPCs and **P3** inquiry/quote/booking workflow RPCs, then wires the vendor app to them. Couple-facing quote acceptance is provided as a shared RPC for the client app to adopt; the vendor app does **not** invent bookings.

## 1. Shared backend (in `kiburan/supabase`)

Migration: `20261111140000_vendor_p2_reads_p3_workflows.sql`

### P2 reads
| RPC | Returns |
| --- | --- |
| `vendor_list_inquiries` | Cursor page of inquiries + couple projection |
| `vendor_get_inquiry` | Inquiry detail + quotes |
| `vendor_list_bookings` | Cursor page of bookings + couple projection |
| `vendor_get_booking` | Booking detail + couple projection |

Couple projection includes wedding title, partner first names / couple label, celebration kind, wedding date, city, inquirer display name. **Contact phone is included only when the vendor already has a confirmed/fulfilled booking with that wedding** (product decision from the audit).

### P3 workflows
| RPC | Who | Effect |
| --- | --- | --- |
| `vendor_update_inquiry_status` | team | `new → replied \| declined \| closed` |
| `vendor_send_quote` | owner/manager | insert `sent` quote; inquiry → `quoted` |
| `vendor_respond_booking` | owner/manager | confirm / decline→cancelled / fulfil; syncs `wedding_vendors.status`; confirm may insert `booked` availability |
| `accept_vendor_quote` | couple (`vendors.manage`) | creates `pending` booking; quote/inquiry → `accepted` |

SQL check: `kiburan/supabase/tests/vendor_p2_p3_workflows.sql` → `vendor_p2_p3_workflows ok`.

Types regenerated in both apps.

## 2. Vendor app

| Screen | Route | Notes |
| --- | --- | --- |
| Inquiries list | `/messages` (tab retitled **Inquiries**) | Filters + infinite cursor list |
| Inquiry detail | `/messages/[inquiryId]` | Couple projection, status actions, quotes |
| Send quote | `/messages/[inquiryId]/quote` | Amount, optional package, description, valid-until |
| Bookings list/detail | existing | Now via P2 RPCs; confirm/decline/fulfil actions |

Dashboard “New Inquiries” opens the inquiries tab.

## 3. Client coordination gap (documented)

`accept_vendor_quote` exists in the shared database, but the **client wedding app does not call it yet**. Until that ships:

- Real production bookings will stay empty unless created by staff/service role.
- Vendor Bookings empty state states this honestly.
- Local smoke can still exercise inquiry → quote; booking confirm is covered by the SQL workflow test.

## 4. Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | clean |
| `npx eslint src --max-warnings 0` | clean |
| `npm run test` | 68 passed |
| SQL `vendor_p2_p3_workflows` | ok |
| Web smoke (`SMOKE_BASE=http://localhost:8092 node ./scripts/smoke-m7.mjs`) | inquiries → quote → bookings; console errors none |

Screenshots: [`screenshots/`](screenshots/).

Seed login: `marketplace.seed@kiburan.local` / `SeedVendorPass1`.

## 5. Not in this milestone

- Client UI for accepting quotes
- Messaging (P5), earnings UI (M8), team invites (P8), notifications (P7)
