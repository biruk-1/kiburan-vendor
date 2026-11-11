# Milestone 8 — Reviews & earnings (booking value)

Status: **complete, waiting for review.** Milestone 9 has not been started.

This milestone adds vendor **reviews** and honest **booking-value earnings**. Direct messaging (**P5**) is intentionally **not** built — the Inquiries tab remains the communication channel until both apps ship chat.

## 1. Shared backend (in `kiburan/supabase`)

Migration: `20261111180000_vendor_p6_earnings_reviews.sql`

| RPC | Purpose |
| --- | --- |
| `vendor_list_reviews` | Cursor page of reviews + reviewer name + couple projection; returns published average/count and pending count |
| `vendor_earnings_summary` | P6 booking-value totals (pipeline / confirmed / completed / agreed deposits) + 6-month series |

SQL check: `kiburan/supabase/tests/vendor_p6_earnings_reviews.sql` → `vendor_p6_earnings_reviews ok`.

Types regenerated in both apps.

**Not built:** payment ledger, payouts, “payments received”, P5 messaging tables, P7 notifications, P8 team invites.

## 2. Vendor app

| Screen | Route | Notes |
| --- | --- | --- |
| Reviews | `/profile/reviews` | Published / pending filters; rating matches marketplace (published only) |
| Earnings | `/profile/earnings` | Pipeline, confirmed, completed, agreed deposits; honest “not payments received” copy |

Entry points: Profile menu (Reviews, Earnings), Profile rating stat, Dashboard rating tile, Dashboard booking-value card, activity rows for inquiries/reviews.

## 3. Messaging decision

P5 remains deferred. Vendor Messages was already retitled **Inquiries** in M7. Building chat without a couple-side inbox would send messages nowhere.

## 4. Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | clean |
| `npx eslint src --max-warnings 0` | clean |
| `npm run test` | 70 passed |
| SQL `vendor_p6_earnings_reviews` | ok |
| Web smoke (`SMOKE_BASE=http://localhost:8092 node ./scripts/smoke-m8.mjs`) | reviews → pending → earnings → profile; console errors none |

Fixtures: `scripts/dev-fixtures/m8-earnings-reviews.sql` (requires M7 smoke wedding).

Screenshots: [`screenshots/`](screenshots/).

Seed login: `marketplace.seed@kiburan.local` / `SeedVendorPass1`.

## 5. Not in this milestone

- Client quote acceptance UI (still M7 gap)
- Messaging (P5), notifications (P7), team invites (P8)
- Payment / payout ledger
- Milestone 9 testing + release
