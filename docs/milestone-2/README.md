# Milestone 2 — Project foundation

Status: **complete, awaiting review.** No feature screens from the design were built. No change was made
to the client app or the shared database.

## Delivered

| Area | Result |
| --- | --- |
| Design analysis | `docs/design/01-figma-analysis-and-screen-plan.md`: 8-screen inventory, navigation map, sampled tokens, component list, screen → data mapping with gaps, undesigned screens, state coverage, responsive rules |
| Project | `kiburan-vendor/`, Expo SDK 58 / RN 0.88 / React 19.3 (same versions as the client), TypeScript strict, Expo Router with typed routes, React Compiler, own git repo |
| Supabase | One client (`src/lib/supabase/client.ts`), anon key, PKCE, AsyncStorage session, 15 s request timeout, localhost → LAN rewrite for Expo Go. Points at the same project as the client |
| Types | `npm run db:types` generates types from the shared database via the client repo's CLI launcher |
| Server state | TanStack Query with retry only on network/timeout, refetch on app focus, user-scoped and vendor-scoped keys; full cache clear on sign-out / user change, per-business cache drop on switch |
| Auth | Password sign-in/up, email-code sign-in (existing accounts only, no account probing), password reset, deep-link handling, session restore with timeout |
| Account discovery | Owned + team businesses merged with role; state machine: restoring → signed out → loading → error → no business → choose business → workspace (with marketplace standing). Stored business choice per user |
| Route protection | `Stack.Protected` guards on `(auth)`, `(onboarding)`, `(vendor)` with `redirectTo="/"`; `index` routes each state. Load errors show retry instead of misrouting to onboarding |
| Design system foundation | Tokens (colors, typography, spacing, radii, sizes, shadow), brand fonts, `AppText`, `Button` (gradient primary / outline / danger / text), `TextField`, `Screen`, `BrandMark`, loading and error views |
| Forms | React Hook Form + Zod (sign-in schema) |
| Foundation screens | Password sign-in, "no business linked" gate, business chooser, workspace summary. All use real data and are labelled as foundation; designed screens replace them in Milestones 3–4 |

## Verification

- `tsc --noEmit` (with generated typed routes), `eslint .`, `vitest run` (26 tests), and `expo-doctor` (20/20) all pass.
- Exercised in the web build against the local shared database as `marketplace.seed@kiburan.local`:
  - Empty submit shows field errors; wrong password shows "Email or password is incorrect."
  - Sign-in discovers the 4 seeded businesses → chooser → workspace for the chosen one.
  - Full reload restores the session and the chosen business.
  - Opening `/sign-in` while signed in redirects to `/home`.
  - Switch business returns to the chooser; sign-out clears the stored session, and opening `/home` signed out redirects to `/sign-in`.
- Not exercised live: the "no business" state with a real account (covered by unit tests; needs a non-vendor test account), iOS/Android devices.

## Deliberately not done

- **Create business** is not offered. A direct `vendors` insert can self-verify (finding S1), so onboarding waits for the reviewed `create_vendor` RPC (P1/P3).
- Zustand not added; no shared client state needs it yet.
- Image picker / upload libraries not added; storage buckets don't exist yet (P4).

## Shared configuration changes still needed (not applied)

1. Add `kiburan-vendor://**` (and the dev `exp://…/--/*` URLs) to `additional_redirect_urls` in `../kiburan/supabase/config.toml` and the hosted dashboard. Password reset and email-confirmation links from the vendor app need it; email-code sign-in does not.
2. Hosted project: enable Email OTP (also listed in the client's own docs).

## Before Milestone 3

Decisions from `docs/milestone-1/04` §4 still affect the designed screens: the revenue card wording, whether Messages is hidden, and whether "Decoration" is added as a category. Designs for the screens in §5 of the design analysis (sign-in, register, onboarding, inquiries, etc.) are welcome; otherwise they will be built from the same design language.
