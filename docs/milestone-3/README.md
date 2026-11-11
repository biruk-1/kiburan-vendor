# Milestone 3 — Figma implementation

Status: **complete, waiting for review.** Milestone 4 (auth and onboarding) has not been started.

All 8 screens from the design board are built, plus Welcome, inside a 5-tab layout. Each screen reads real data from the shared Supabase project with the anon key under the existing RLS policies. No schema, policy or client-app changes were made. No numbers are fabricated: every count, amount and rating on screen comes from a database row, and where the backend has no data for a designed element, the element is hidden or replaced with a plain statement.

## 1. What was built

### Navigation

```
/welcome ── Get Started ─► /register (honest "coming soon" gate) ─► /sign-in
         └─ Sign In ─────► /sign-in ─► account state ─► tabs

Tabs (src/app/(vendor)/_layout.tsx, expo-router/js-tabs), each tab its own stack so the bar stays visible:
  Home      /home
  Bookings  /bookings → /bookings/[bookingId]
  Services  /services → /services/new, /services/[serviceId]/edit
  Messages  /messages
  Profile   /profile
```

- Signed-out users now land on Welcome (previously sign-in).
- **Deep-link fix:** reloading or opening `/bookings`, `/services/new` and similar links used to bounce to `/home`. The route guards mounted while the business list was still loading, saw "not a workspace" and redirected to `/`. The root navigator now shows the loading view until the account state resolves, so the original URL is kept.

### Screens and their data

| Screen | Data source (all scoped to the active business) | Design elements changed or held back |
| --- | --- | --- |
| Welcome | static | Hero is the licensed Pexels photo from M2 until the board's photo is supplied |
| Dashboard | `profiles.display_name`; `vendor_inquiries` count where `status='new'`; `vendor_bookings` count pending+confirmed (via `wedding_vendors!inner`); average of **published** `vendor_reviews`; booking value by month; latest inquiries/bookings/reviews | Revenue card is **"Confirmed bookings this month"**: the sum of `total_amount` for confirmed+fulfilled bookings dated this month, ETB only. It is labelled "Agreed booking value — not payments received". The trend % shows only when last month is non-zero, and other currencies are excluded with a note. The bell icon is hidden (no notifications). There is no "View All" (no activity screen yet). The promo "Learn More" button is omitted (no target). Only the Bookings tile is tappable; the Inquiries and Reviews screens come in M7/M8 |
| Bookings | `vendor_bookings` + `wedding_vendors!inner(vendor_id)` + quote → package → service; offset pagination (20/page, `useInfiniteQuery`, `FlatList`) | Couple names are not shown (vendors can't read `weddings`, proposal P2); the second line shows the package name instead. "In Progress" is derived (`confirmed` and now within `start_at…end_at`). The calendar icon is hidden (availability screen is M6). Filters: All / Pending / Confirmed / Completed (= `fulfilled`) / Cancelled, with counts |
| Booking Details | same row by id + vendor | Location, Contact Client, View Contract and the ⋮ menu are hidden: venue/contact need P2, contracts need a storage bucket (P4), and status actions need workflow RPCs (P3; direct updates are security hole S4). A note says couple details aren't shared yet. The deposit row appears when set |
| My Services | `vendor_services` (+ category); first `vendor_media` image per service | ⋮ menu: Edit / Activate–Deactivate / Delete with confirmation. Services without their own photo show a neutral placeholder rather than another image. Staff see a read-only grid with no "+" or ⋮ (RLS also blocks their writes) |
| Add / Edit Service | insert/update `vendor_services` (`title`, `category_id`, `description`, `base_price`, `currency_code='ETB'`) | The photo drop zone is shown **disabled** with "Photo uploads aren't available yet" (no vendor bucket, P4). Zod validation follows the column rules (`numeric(14,2)`, `>= 0`). The 120/1000-character limits are app-side only |
| Messages | none | Designed header only, plus an empty state: "Messaging isn't available yet". There are no sample conversations or chips (P5) |
| Profile | `vendors` (cover, created_at), published review average, distinct weddings with `fulfilled` bookings | "Years experience" became **"Member since {year}"** (no such column). Menu rows without screens are disabled with a "Soon" tag; Notification Preferences is hidden; "Earnings & Payouts" became "Earnings" (no payouts data). "Switch business" appears when the user has more than one business. Sign Out works. The cover falls back to a vector tibeb pattern when `cover_url` is empty |
| Register (not designed) | none | Says that vendor sign-up arrives in Milestone 4 and links to Sign In |

### Reusable components added

`HeaderBar`, `LargeTitleHeader`, `Screen` (now with a fixed header slot and pull-to-refresh), `TabStack`, `Card`, `StatusPill`, `FilterChips`, `IconButton`, `Avatar`, `Thumb`, `Skeleton`/`SkeletonCard`, `SelectField` (bottom sheet), `ActionSheet` (menus and confirmations; Alert buttons don't work on web), `EmptyState`, `InlineError`, `Sparkline`, `TibebPattern`, `VerificationPill`, `BookingCard`, `ServiceGridCard`.

### State coverage

Every data screen has a skeleton loading state, an empty state worded per filter, an inline error with retry, and pull-to-refresh. Booking detail also has a "not found" state, which covers ids that belong to another business. Mutations show inline errors, and deleting a service that is referenced by inquiries or quotes returns a specific message (FK `23503`).

## 2. Data layer

Each feature has typed service functions that return `ServiceResult`, plus TanStack Query hooks:

| Feature | Services | Query keys |
| --- | --- | --- |
| dashboard | `getDashboard` (6 parallel queries) | `['vendor', id, 'dashboard']` |
| bookings | `listBookings`, `getBookingStatuses`, `getBooking`, `countClients` | `['vendor', id, 'bookings', …]` |
| services | `listServices`, `getService`, `createService`, `updateService`, `setServiceActive`, `deleteService`, `listCategories` | `['vendor', id, 'services', …]`, `['reference', 'vendor-categories']` |
| business-profile | `getVendorDetails`, `getVendorImages`, `getMyDisplayName` | `['vendor', id, 'details' \| 'images']`, `['user', uid, 'profile']` |
| reviews | `getReviewSummary` | `['vendor', id, 'reviews', 'summary']` |

- Writes filter by both `vendor_id` and `id`, and use `count: 'exact'`. A write that RLS silently filters out (0 rows) is reported as "You can't edit this service" instead of looking successful.
- Mutations invalidate only that business's services.
- Sign-out now also clears the stored "active business" preference, so a shared device doesn't reveal which business the last person used. The query cache was already cleared on sign-out (M2).

## 3. Verification

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npx eslint .` | clean |
| `npx vitest run` | 49 tests passing (new: booking value summary, service form schema, price formatting) |
| Web build at 390×844 against local Supabase (seed owner `marketplace.seed@kiburan.local`) | All screens render with no console errors. Tested: Welcome → Register → Sign In; sign-in → dashboard (real: 17 new inquiries, 0 bookings, "No reviews yet", real activity); bookings empty state; services grid; add-service validation; create → deactivate → edit → delete through RLS; deep-link reload on every tab; sign-out back to Welcome with storage cleared |

Screenshots are in [`screenshots/`](screenshots/). `08-profile.png` was taken just before a small fix that vertically centres the "Soon" tags.

### Temporary fixture data (local only, already removed)

The shared database has **no bookings, quotes or reviews at all**, so to check the booking UI I loaded [`scripts/dev-fixtures/m3-bookings.sql`](../../scripts/dev-fixtures/m3-bookings.sql) into the **local** Supabase. It adds one wedding link, one quote, five bookings (one per status, plus an in-progress one) and one published review for Lumen & Lace Studio. All ids are `ffffffff-0003-…` and the rows are marked `DEV FIXTURE`. With them the dashboard showed 3 active bookings, ETB 105,000 this month (+110% vs ETB 50,000 last month) and a 5.0 rating, all matching the inserted rows. I then ran [`m3-bookings-cleanup.sql`](../../scripts/dev-fixtures/m3-bookings-cleanup.sql) and confirmed the counts are back to 0 bookings, 0 quotes, 4 wedding links and 0 reviews. The UI-created test service was deleted through the app.

**Not exercised:** the "service is in use" delete message. I chose not to attempt a delete against the real seed service.

## 4. Decisions needed from you

1. **Revenue card label.** Keep "Confirmed bookings this month" (agreed value) until payment records exist (P6)?
2. **Messages tab.** Keep it with the "not available" state, or hide it (4 tabs) until P5 is approved?
3. **Welcome "Get Started".** It currently leads to an honest "coming soon" page. M4 replaces this with real sign-up and onboarding.
4. **Design assets still missing:** the official monogram SVG, the board's Welcome photo, the Profile tibeb cover artwork, and the promo banner image.
5. The open questions from `docs/milestone-1/04` §4 and the redirect-URL config change from Milestone 2 are still pending.

## 5. Known limitations (by design until later milestones)

- The vendor app cannot show couple names, venues or contacts until the P2 read RPCs exist.
- Booking status changes, quotes and inquiry handling are Milestone 7 and need P3.
- Photo upload needs the P4 storage bucket.
- On web, the first visit to each route in development shows a short "Bundling…" pause. This is Metro lazy bundling, not app loading time.
- The dev server ran out of memory once after many full reloads with `web.output: "static"`. Starting it with `NODE_OPTIONS=--max-old-space-size=8192` avoids that in development.
