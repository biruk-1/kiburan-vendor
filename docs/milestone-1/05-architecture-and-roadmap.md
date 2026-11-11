# 05 — Proposed vendor app architecture and development roadmap

## 1. Repository layout

```
kiburan Wedding/
  kiburan/            ← client app (untouched). Owns supabase/ migrations, seed, config.toml
  kiburan-vendor/     ← vendor app (new, separate Expo project, own git repo)
    docs/milestone-1/ ← this audit
```

- The vendor app has **no** `supabase/` folder of its own. There is one migration history for the one shared database, and it stays in `kiburan/supabase/migrations`. Vendor migrations are added there (prefixed `vendor_`), reviewed, and applied once for both apps.
- Database types: the vendor app generates `src/types/database.types.ts` from the same running database (`supabase gen types typescript --local` run against the `kiburan` stack, or `--project-id` for hosted). Never hand-edited.
- No shared npm package for now. The handful of infrastructure files worth reusing (`supabaseUrl.ts`, `fetchWithTimeout.ts`, `authStorage.ts`, query-client defaults) are copied and owned by the vendor app. A shared package can be extracted later if duplication grows.

## 2. Stack

Pinned to the client's versions so both apps behave identically against the backend and can share knowledge:

| Concern | Choice |
| --- | --- |
| Runtime | Expo SDK 58, React Native 0.88, React 19.3, TypeScript (strict) |
| Routing | Expo Router (typed routes) |
| Backend | `@supabase/supabase-js` 2.x, anon key, PKCE, single client in `src/lib/supabase/client.ts` |
| Session storage | AsyncStorage-backed adapter (same as client). Supabase sessions exceed SecureStore's value size limit; if encryption at rest is required later, use the AES-key-in-SecureStore + ciphertext-in-AsyncStorage pattern |
| Server state | TanStack Query 5 (keys namespaced by `userId` and `vendorId`) |
| Client state | React context for auth session and active vendor. Zustand only if a cross-screen draft (e.g. multi-step onboarding) needs it |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) |
| Images | `expo-image` (memory + disk cache), `expo-image-picker`, resized before upload with `expo-image-manipulator` |
| Lists | `FlatList`/`SectionList` with cursor pagination via `useInfiniteQuery` |
| Fonts / brand | Same Kiburan brand families as the client (Cormorant Garamond display, DM Sans body) — final tokens come from the Figma analysis |
| Tests | Vitest for pure logic; SQL tests in `kiburan/supabase/tests` for every vendor RPC/policy |

## 3. Source structure

Adapted from the proposed structure to what the backend actually supports. Modules whose backend does not exist yet (messages, notifications, earnings ledger, team invites) get a folder only when their backend lands.

```
app/
  _layout.tsx                 providers, fonts, splash, auth gate
  index.tsx                   redirect by account state
  (auth)/                     welcome, sign-in, register, verify-otp, forgot/reset password
  (onboarding)/               create-business steps, submitted/pending, rejected, choose-business
  (vendor)/
    _layout.tsx               requires session + active vendor
    (tabs)/                   home, bookings, services, messages*, profile   (* per design decision)
    inquiries/[inquiryId]     detail, send-quote
    bookings/[bookingId]      detail
    services/new, [serviceId]/edit, [serviceId]/packages
    availability/
    profile/business, profile/media, profile/team, profile/reviews, profile/settings

src/
  components/ui/ layout/ feedback/      design-system primitives, skeletons, empty/error states
  features/
    auth/          session, sign-in/up, OTP, deep links
    account/       vendor account discovery + state machine, active-vendor context
    onboarding/
    dashboard/
    inquiries/
    bookings/
    services/      (packages live here; they belong to services in the schema)
    availability/
    business-profile/  (includes media/portfolio)
    reviews/
    team/
    earnings/      (booking-value metrics only until a payment ledger exists)
  lib/supabase/    client.ts, storage adapter, url resolver, errors
  lib/query/       queryClient, keys, cache reset on sign-out / vendor switch
  theme/           tokens from Figma
  types/           database.types.ts (generated), domain types
  utils/
```

Each feature folder follows the client's proven pattern: `services/` (Supabase calls returning `{ ok, data | error }`), `hooks/` (TanStack Query wrappers), `screens/`, `components/`, `validation/`, plus `*.test.ts` for logic.

## 4. Account-state resolution

On session restore, one query (later the `vendor_dashboard_summary`/account RPC) loads vendors the user owns or belongs to, with role, `verification_status`, `listing_status`.

```
no session                          → (auth)/welcome
session, zero vendors               → (onboarding)/create-business
one+ vendors, none chosen           → (onboarding)/choose-business (auto-pick if exactly one)
active vendor unverified + draft    → (onboarding) resume / submit for review
active vendor pending               → limited workspace + "under review" state
active vendor rejected              → rejected state with edit + resubmit
active vendor verified              → (vendor)/(tabs)/home  (draft shows "publish listing" prompt)
active vendor suspended             → read-only workspace + suspended notice
```

Pending vendors may still edit their profile and services (RLS allows it) so the listing is ready at approval time. Inquiries and bookings tabs are shown only when data exists, because unpublished vendors cannot receive inquiries through the marketplace.

## 5. Performance rules

- One Supabase client; one QueryClient; `staleTime` per data class (reference data long, inquiries/bookings short, refetch on app focus).
- Dashboard from one summary RPC, not N count queries.
- Cursor pagination (`created_at`, `id`) for inquiries, bookings, reviews, media.
- Select explicit columns, never `*`, in list queries.
- Images uploaded at ≤ 1600 px, rendered with `expo-image` and explicit dimensions.
- Optimistic updates only for reversible toggles (service active flag); status changes wait for the RPC result.
- On sign-out or business switch: `queryClient.clear()` and reset active-vendor context.
- Skeletons per screen; no artificial delays.

## 6. Development roadmap

Backend work (shared `kiburan/supabase`) is interleaved where the vendor app depends on it. Each milestone ends with a review before continuing.

| # | Milestone | Vendor app work | Backend prerequisite |
| --- | --- | --- | --- |
| 1 | Audit (this) | Docs only | — |
| 1b | Figma analysis | Screen inventory, navigation map, tokens, component list, state coverage, screen → table/RPC map | — |
| 2 | Foundation | Expo project, Router, TS strict, lint, Supabase client, Query client, auth context, route guards, theme tokens | Add vendor deep-link scheme to auth redirect allow list |
| 3 | Figma implementation | UI primitives + all screens with loading/empty/error states, wired to typed service stubs that return real "not available" states (no fake data) | — |
| 4 | Auth + onboarding | Sign-in/up, OTP, account discovery, create-business, submit-for-review, state screens | **P1** security hardening, `create_vendor`, `submit_vendor_for_verification` |
| 5 | Dashboard + business profile | Summary metrics, profile edit, logo/cover/portfolio upload | **P2** summary RPC, **P4** storage |
| 6 | Services, packages, availability | CRUD, activation, service photos, calendar | P9 indexes |
| 7 | Inquiries + bookings + quotes | Inquiry list/detail, status, quotes, booking list/detail, accept/decline/fulfil | **P2** read RPCs, **P3** workflow RPCs, coordinated client change for quote acceptance → booking |
| 8 | Reviews, earnings, messages | Reviews list + rating; booking-value earnings; messages only if P5 approved | P5/P6/P7 per decisions |
| 9 | Testing + release | SQL RLS tests for every vendor path (staff vs manager vs owner vs outsider), CRUD tests, navigation, perf profiling, client-app regression | — |

## 7. Immediate recommendation

Before any vendor reaches production, apply **P1** even if the vendor app is delayed. S1 (self-verified vendors) is exploitable today by any signed-in user with the public anon key. S2–S4 require being a vendor team member, which S1 makes trivial; the attacker also needs the target wedding's UUID, which limits but does not remove the risk.
