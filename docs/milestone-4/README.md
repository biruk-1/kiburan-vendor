# Milestone 4 — Auth and onboarding

Status: **complete, waiting for review.** Milestone 5 has not been started.

This milestone adds real vendor registration and business onboarding, and applies the reviewed **P1** shared-backend changes that make onboarding safe (no self-verified listings).

## 1. Shared backend (in `kiburan/supabase`)

Migration applied locally:

`migrations/20261110120000_vendor_p1_security_and_onboarding.sql`

| Change | Effect |
| --- | --- |
| `protect_vendor_verification` on INSERT | Client inserts are forced to `unverified` + `draft` (closes **S1**) |
| Owner / team / booking-status / quote integrity triggers | Closes **S5** (partial) and **S6**; booking status jumps are constrained |
| Couple-table UPDATE policies | Vendors can no longer directly update `wedding_vendors`, `vendor_inquiries`, or `vendor_bookings` (closes **S2–S4** writes; P3 RPCs in M7 restore intentional actions) |
| `create_vendor(...)` RPC | Atomic create: vendor row + owner team row + category memberships, always draft/unverified |
| `submit_vendor_for_verification(vendor_id)` RPC | Owner-only; completeness checks; sets `pending` |

SQL check: `kiburan/supabase/tests/vendor_onboarding_p1.sql` (rolls back; reports `vendor_onboarding_p1 ok`).

Redirect allow list updated in `kiburan/supabase/config.toml` for `kiburan-vendor://**` and port `8091` web URLs. **Restart local Supabase** (`npx supabase stop` then `start` from the client repo) so GoTrue picks up the redirect URLs before testing password-reset deep links. Hosted dashboard still needs the same URLs added manually.

Vendor app types regenerated with `npm run db:types`. The client app should regenerate its types when convenient; no client UI change was required.

## 2. Vendor app

### Auth

| Screen | Route | Notes |
| --- | --- | --- |
| Welcome | `/welcome` | Get Started → Register |
| Register | `/register` | Name, email, password; uses existing `signUp` |
| Sign In | `/sign-in` | Password, email-code, forgot-password, create-account links |
| Verify email / code | `/verify-email` | OTP entry; local Supabase often auto-confirms so this is mainly for hosted / email-code sign-in |
| Forgot password | `/forgot-password` | Always shows the same success copy (no account probing) |
| Reset password | `/reset-password` | Recovery deep-link; route guards keep the auth stack available while `isPasswordRecovery` |

### Onboarding

| Screen | Route | Notes |
| --- | --- | --- |
| Create business | `/create-business` | Replaces the old “not available” gate. Fields: name, categories, city, description, phone/email. **Save draft** or **Submit for review** |
| Choose business | `/choose-business` | Unchanged |

Dashboard shows a **StandingBanner** for draft / pending / rejected / suspended (submit again when draft or rejected and the user is the legal owner).

## 3. Verification

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npx eslint src` | clean (no errors) |
| `npx vitest run` | 52 tests |
| SQL `vendor_onboarding_p1` | ok |
| Web smoke (`node ./scripts/smoke-m4.mjs`) | Register → create **M4 Smoke Studio** → submit → Home with **Under review** banner; no console errors |

Screenshots: [`screenshots/`](screenshots/) — Welcome, create-business form, filled form, and dashboard with **Under review**.

Seed login still works: `marketplace.seed@kiburan.local` / `SeedVendorPass1`.

## 4. Decisions still open

Same as earlier milestones where relevant: revenue label, Messages tab, design assets, who approves vendors (operator procedure vs admin app), and hosted redirect URLs.

## 5. Not in this milestone

- Admin approval UI (out of scope; service-role / SQL only)
- Logo/cover upload (P4 / Milestone 5)
- Inquiry / booking workflow RPCs (P3 / Milestone 7)
- Messaging (P5)
