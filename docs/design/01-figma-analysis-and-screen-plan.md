# Figma analysis and screen-by-screen implementation plan

Source: one design board with 8 phone screens (`assets/image-74131fa3-…jpg`, 958 × 1024 px). Each phone is ≈ 233 px wide on the board, so **1 board px ≈ 1.67 pt** on a 390 pt-wide device. Colors below were sampled from the board pixels; sizes are converted with that ratio and rounded to the 4 pt grid. Treat sizes as ±2 pt until a Figma file or export with exact specs is available.

## 1. Screen inventory and navigation

| # | Screen (board position) | Route | Tab bar |
| --- | --- | --- | --- |
| 1 | Welcome (top-left) | `/(auth)/welcome` | no |
| 2 | Dashboard (top, 2nd) | `/(vendor)/(tabs)/home` | Home active |
| 3 | Bookings list (top, 3rd) | `/(vendor)/(tabs)/bookings` | Bookings active |
| 4 | Booking Details (top-right) | `/(vendor)/(tabs)/bookings/[bookingId]` | visible, Bookings active |
| 5 | My Services (bottom-left) | `/(vendor)/(tabs)/services` | Services active |
| 6 | Add Service (bottom, 2nd) | `/(vendor)/(tabs)/services/new` | visible, no tab highlighted on board (treated as Services) |
| 7 | Messages (bottom, 3rd) | `/(vendor)/(tabs)/messages` | Messages active |
| 8 | Profile (bottom-right) | `/(vendor)/(tabs)/profile` | Profile active |

Navigation model derived from the board:

```
Welcome ──Get Started──► Register ──► Onboarding ──► Tabs
        └─Sign In──────► Sign in ───► (account state) ──► Tabs

Tabs (5): Home │ Bookings │ Services │ Messages │ Profile
  Home     → stat tiles deep-link: New Inquiries → Inquiries, Bookings → Bookings, Rating → Reviews
           → Recent activity rows → inquiry / booking / review detail
           → business name chevron → business switcher sheet
  Bookings → Booking Details (stack inside tab, tab bar stays visible)
  Services → Add Service (+ button), service card → Edit Service; ⋮ menu → activate/deactivate, delete
  Messages → conversation (not designed)
  Profile  → Business Profile, Business Settings, Notification Preferences, Earnings & Payouts,
             Support & Help, About, Sign Out
```

Each tab is its own stack so detail screens keep the tab bar visible, as the board shows for Booking Details and Add Service. My Services shows a back chevron on the board; as a tab root it has nowhere to go back to, so the chevron is rendered only when the screen is pushed from elsewhere (e.g. from Profile).

## 2. Design tokens

### Color (sampled)

| Token | Value | Seen on |
| --- | --- | --- |
| `background` | `#FBF1E5` | Page background (warm cream) |
| `backgroundAlt` | `#FBEEDF` | Slightly deeper cream on list screens |
| `surface` | `#FFFBF5` | Cards, list rows, inputs |
| `surfaceMuted` | `#F5ECE0` | Inactive chips, upload drop zone |
| `border` | `#EFE3D3` | Card and input hairlines |
| `divider` | `#F2E8DC` | Row separators in detail cards |
| `primary` | `#CF954B` | Primary buttons, active chips, + button |
| `primaryLight` | `#DBA359` | Top of the button gradient |
| `primaryDark` | `#B9812F` | Pressed state, active tab, gold text links |
| `primaryMuted` | `#F3E2C6` | Gold icon tiles, outline-button fill |
| `heading` | `#1E1712` | Titles (near-black warm brown) |
| `text` | `#2B241E` | Body |
| `textMuted` | `#6E655C` | Subtitles, meta lines |
| `textSubtle` | `#9A9189` | Placeholders, inactive tab labels |
| `success` / `successMuted` | `#2F6B4A` / `#DDEFE3` | Confirmed, Completed, Active, Verified, +12% |
| `warning` / `warningMuted` | `#B07433` / `#FBE6C8` | Pending |
| `info` / `infoMuted` | `#4A6F9A` / `#E1ECF7` | In Progress |
| `danger` / `dangerMuted` | `#D9573A` / `#FBE5DE` | Unread badge, Sign Out |
| `onPrimary` | `#FFFFFF` | Text on gold |

The vendor app intentionally differs from the client (client headings are forest green `#315B48`; vendor headings are warm near-black). Gold is close to the client's `#C6A064` but deeper and warmer, as the board shows.

### Typography

Families are the existing Kiburan brand fonts (already licensed through `@expo-google-fonts`):

| Variant | Family | Size / line | Use on board |
| --- | --- | --- | --- |
| `brand` | Cormorant Garamond 700 | 40 / 44 | "Kiburan" on Welcome |
| `brandSub` | Cormorant Garamond 600 | 28 / 32 | "Vendor" on Welcome |
| `largeTitle` | DM Sans 700 | 28 / 34 | "Bookings", "Messages" tab titles |
| `greeting` | DM Sans 700 | 24 / 30 | "Good morning, Meskel!" |
| `title` | DM Sans 700 | 18 / 24 | Header titles ("Booking Details"), detail card title, profile name |
| `headline` | DM Sans 700 | 15 / 20 | Card titles, section headers ("Recent Activities") |
| `body` | DM Sans 400 | 15 / 22 | Body, inputs |
| `bodyMedium` | DM Sans 500 | 15 / 22 | Row titles |
| `label` | DM Sans 600 | 13 / 18 | Field labels, chips, button-small |
| `caption` | DM Sans 400 | 12 / 16 | Meta lines, timestamps, stat labels |
| `stat` | DM Sans 700 | 22 / 26 | Stat numbers, revenue figure |
| `tab` | DM Sans 500 | 11 / 14 | Tab bar labels |
| `button` | DM Sans 700 | 16 / 20 | Primary buttons |

### Spacing, radius, elevation

- Spacing scale: 4, 8, 12, 16, 20, 24, 32. Screen horizontal padding **20**. Card inner padding **16**. Gap between cards **12**.
- Radius: chips / pills / primary buttons **999**; cards **16**; inputs **12**; thumbnails **12**; icon tiles **12**; avatar **999**.
- Elevation: cards use a soft warm shadow (`#8A6A3F`, opacity 0.08, radius 12, y 4) plus a 1 pt `border`; no heavy Material shadows.
- Heights: primary button 52 (Welcome 56), input 48, chip 32, tab bar 64 + safe area, list thumbnail 76 × 76.

### Iconography

Thin-stroke line icons (≈ 1.75 pt stroke), gold for decorative tiles, charcoal for actions. `@expo/vector-icons` **Feather** matches this style most closely (calendar, clock, map-pin, phone, file-text, star, message-circle, user, home, plus, more-vertical, chevron-right/left, bell, search, camera). Ionicons outline is the fallback for glyphs Feather lacks.

### Imagery and brand assets

| Asset | Status | Placeholder used |
| --- | --- | --- |
| Gold interlaced Kiburan monogram | **Missing official SVG** (client also only approximates it) | Port of client `BrandMark` SVG |
| Welcome hero (reception table with tibeb runner) | Not supplied | Client `fusion/hero.jpg` (licensed Pexels reception hall) with dark gradient |
| Profile cover tibeb band | Not supplied | Client's original vector tibeb ornaments |
| Promo banner image | Not supplied | Client `fusion/atmosphere.jpg` |
| Service / booking thumbnails | Come from vendor media | — |

## 3. Reusable components (from repeated patterns)

| Component | Appears on |
| --- | --- |
| `Screen` (cream background, safe area, optional scroll) | all |
| `HeaderBar` (back chevron, centered title, right action) | Booking Details, My Services, Add Service |
| `LargeTitleHeader` (left title, right icon button) | Bookings, Messages |
| `BusinessHeader` (avatar, name + chevron, verified pill, bell with dot) | Dashboard |
| `Button` variants: `primary` (gold gradient pill), `outline` (gold border, cream fill, icon), `danger-outline` | Welcome, Booking Details, Add Service, Profile |
| `TextLink` | "Sign In", "View All ›" |
| `FilterChips` (label + count, horizontal scroll) | Bookings, My Services, Messages |
| `StatusPill` (confirmed / pending / in-progress / completed / active / inactive / verified) | Bookings, Detail, Services, Dashboard, Profile |
| `StatTiles` (3 equal tiles with icon, number, label, dividers) | Dashboard, Profile (no icons) |
| `MetricCard` with sparkline | Dashboard revenue |
| `ActivityRow` (icon tile, title, relative time, chevron) | Dashboard |
| `PromoBanner` (text + image) | Dashboard |
| `BookingCard` (thumb, title, couple, date/time, status, "View Details ›") | Bookings |
| `DetailHero` (image + status pill overlay) + `InfoRow` (icon, label, value) | Booking Details |
| `ServiceGridCard` (image, name, "ETB x+", ⋮, status) | My Services (2-column grid) |
| `ImageDropzone` (dashed, camera icon, helper text) | Add Service |
| Form fields: `TextField`, `SelectField`, `TextArea`, `CurrencyField`, required asterisk | Add Service |
| `ConversationRow` (avatar or initials, name, preview, time, unread count) | Messages |
| `ProfileHero` (pattern cover, ringed monogram avatar, name, verified) + `MenuRow` | Profile |
| `TabBar` (5 icons + labels, gold active) | all tab screens |
| `Skeleton`, `EmptyState`, `ErrorState`, `Toast` | not drawn — required |

## 4. Screen-by-screen plan, data mapping, and gaps

Legend: ✅ supported by current backend · ⚠ needs a reviewed backend change (IDs refer to `docs/milestone-1/04`) · ✖ not supported; UI will be hidden or show an honest unavailable state.

### 4.1 Welcome
Full-bleed photo with bottom dark gradient, monogram, "Kiburan / Vendor", tagline "Grow Your Business, Serve More Couples", **Get Started** (→ Register) and **Sign In** text link. ✅ No data.

### 4.2 Dashboard
| Element | Data | Status |
| --- | --- | --- |
| Business avatar, name, chevron | `vendors.logo_url`, `business_name`; switcher if > 1 vendor | ✅ (logo upload ⚠ P4) |
| "Business Verified" pill | `verification_status = 'verified'`; other states get their own pill (Pending review, Not verified, Rejected) | ✅ |
| Bell with dot | notifications | ✖ P7 — bell hidden until notifications exist |
| Greeting "Good morning, {first name}" | `profiles.display_name` + local time of day | ✅ |
| New Inquiries count | `vendor_inquiries` `status = 'new'` | ✅ (count only — RLS allows) |
| Bookings count | `vendor_bookings` `pending + confirmed` | ✅ via `wedding_vendors` join; will be 0 until bookings exist |
| Rating | avg of **published** `vendor_reviews.rating` | ✅; shows "—" with "No reviews yet" when none |
| "This Month Revenue ETB … ↑12%" + sparkline | No payment records | ✖ Replaced by **"Confirmed bookings this month"** (sum of `total_amount` of confirmed/fulfilled bookings by `booking_date`) with the same card layout. Trend shown only when last month is non-zero. Needs approval of the label change. |
| Recent Activities | union of latest inquiries (`created_at`), bookings (`created_at`), published reviews (`created_at`) | ✅ for "new inquiry", "new booking request", "new review". "Booking confirmed" has no timestamp (no `updated_at`) ⚠ P9 |
| Promo "Grow Your Business with Kiburan / Learn More" | Static content | ✅ static; "Learn More" target needed from you |

### 4.3 Bookings list
| Element | Data | Status |
| --- | --- | --- |
| Filter chips All / Pending / Confirmed / Completed (+ Cancelled, off-screen) with counts | `vendor_bookings.status` | ✅ (Completed = `fulfilled`) |
| "In Progress" pill | No such status | Derived: `confirmed` and `start_at ≤ now ≤ end_at`. Not a filter. |
| Thumbnail | Service cover from `vendor_media` (service) → vendor cover → category placeholder | ✅ (once media exist) |
| Title "Wedding Decoration" | Service title via `quote → package → service`, else inquiry service, else category | ⚠ P2 read RPC |
| Couple "Tsehay & Daniel" | `weddings.partner_one_name / partner_two_name` | ⚠ P2 (vendors cannot read `weddings`) |
| Date and time | `booking_date`, `start_at` | ✅ |
| Calendar icon (top-right) | → Availability calendar | ✅ |
| Pagination | cursor on `start_at`/`created_at` | ✅ |

### 4.4 Booking Details
| Element | Data | Status |
| --- | --- | --- |
| Hero image + status pill | as list | ✅ |
| Title, couple | as list | ⚠ P2 |
| Date, Time | booking fields | ✅ |
| Location "Skylight Convention Center" | `wedding_events.venue_name` via inquiry `requested_event_id` or `wedding_vendors.event_id` | ⚠ P2 |
| Service Details text | service / quote description | ⚠ P2 |
| Total Amount | `total_amount` (+ deposit row if set) | ✅ |
| Contact Client | couple contact | ⚠ P2 + your decision on when contact is revealed |
| View Contract | `contract_storage_path` | ✖ P4 bucket; button hidden when null |
| ⋮ menu | Confirm / Decline / Mark completed / Cancel | ⚠ P3 workflow RPCs (direct updates are the security hole S4) |

### 4.5 My Services
Chips All / Active / Inactive with counts (✅ `is_active`). 2-column grid of `ServiceGridCard`: cover image (⚠ P4 for uploads; seed URLs work), title, "ETB {base_price}+" (✅; "Price on request" when null; unit suffix when not `package`), ⋮ menu (Edit, Packages, Activate/Deactivate, Delete) ✅ for owner/manager; staff see read-only (RLS enforces). **+** → Add Service.

### 4.6 Add Service (and Edit Service)
| Field | Column | Status |
| --- | --- | --- |
| Upload Photos (JPG, PNG up to 10 MB) | `vendor_media` with `service_id` | ⚠ P4. Bucket proposal used 5 MB; images will be resized on device to ≤ 1600 px so 10 MB source files are accepted and uploaded small. |
| Service Name * | `title` | ✅ |
| Category * | `category_id` (list from `vendor_categories`) | ✅ ("Decoration" not seeded — data change) |
| Description | `description` | ✅ |
| Starting Price (ETB) * | `base_price`, `currency_code = 'ETB'` | ✅ |
| (not drawn) Price unit, Active toggle | `price_unit`, `is_active` | ✅ — added below price, collapsed under "More options" |
| Save Service | insert / update | ✅ |

### 4.7 Messages
Chips All / Unread, search, conversation rows with unread badges. **✖ No messaging backend** (P5). Until approved, the Messages tab shows the designed header with an honest empty state ("Messaging isn't available yet. Reply to couples from Inquiries."), and links to the Inquiries list, which is the real communication channel today. If you decide to hide the tab instead, the bar drops to 4 items.

### 4.8 Profile
| Element | Data | Status |
| --- | --- | --- |
| Cover pattern, ringed avatar, name, Verified Vendor | `cover_url`/tibeb fallback, `logo_url`, `business_name`, `verification_status` | ✅ (uploads ⚠ P4) |
| 4.8 Rating | published review avg | ✅ |
| 120+ Clients | distinct weddings with `fulfilled` bookings | ⚠ P2 summary RPC |
| 2 Years Experience | no column | ✖ replaced by "Member since {year}" from `vendors.created_at` unless a column is approved |
| Business Profile | edit `vendors` + categories + media | ✅ |
| Business Settings | listing status (publish/unpublish), team | ✅ / team ⚠ P8 |
| Notification Preferences | | ✖ P7 — row hidden |
| Earnings & Payouts | booking-value report | ⚠ renamed "Earnings" (no payouts) |
| Support & Help, About Kiburan Vendor | static | ✅ |
| Sign Out | `auth.signOut` + cache clear | ✅ |

## 5. Screens required but not designed

These are needed for a working product. They will be built from the same tokens and components so they read as part of the board; **please send designs for any you want to control precisely**:

Sign In, Register, Email code (OTP) verification, Forgot / Reset password, Onboarding (business basics → categories → contact & location → logo/cover → review & submit), Under review / Rejected / Suspended states, Business switcher sheet, **Inquiries list + Inquiry detail + Send quote** (the board has no inquiry screen, only the dashboard count), Edit service, Packages list/editor, Availability calendar, Business profile editor, Portfolio manager, Reviews list, Team list, Earnings report, Settings.

## 6. State coverage (not drawn, will be implemented)

| Screen | Loading | Empty | Error |
| --- | --- | --- | --- |
| Dashboard | skeleton header + 3 tiles + card + 3 rows | zero counts + "Complete your profile" checklist for new vendors | inline retry card |
| Bookings | 4 skeleton cards | per filter ("No pending booking requests") | full-screen retry |
| Booking detail | skeleton hero + rows | n/a (404 → "Booking not found") | retry |
| Services | 4 grid skeletons | "Add your first service" + button | retry |
| Add/Edit service | — | — | field errors (Zod) + submit error banner; upload progress per photo |
| Messages | — | unavailable state (above) | — |
| Profile | skeleton hero | — | retry |
| Global | splash until session restored | — | offline banner; session-expired → sign-in |

Success feedback: toast after save/delete/status change; destructive actions confirm via native alert.

## 7. Responsive behavior

- Designed at ≈ 390 pt. Stat tiles and the services grid use flex fractions, so they work from 360 pt (small Android) upward; numbers shrink one step below 360 pt.
- Services grid: 2 columns on phones, 3 at ≥ 600 pt, content max width 720 pt centered on tablets/web.
- Text respects system font scaling up to 1.3×; tab labels and pills cap at 1.2× to avoid clipping.
- Safe areas on all edges; tab bar height adds bottom inset.

## 8. Implementation order (Milestone 3)

1. Primitives: `Screen`, `Text` variants, `Button`, `IconButton`, `StatusPill`, `FilterChips`, `Card`, `Skeleton`, `EmptyState`, `ErrorState`.
2. Tab bar + tab stacks + headers.
3. Welcome, Dashboard, Bookings, Booking Details, My Services, Add Service, Messages, Profile — each with its loading/empty/error states, wired to typed service functions that return real data where the backend supports it and an explicit "unavailable" result where it does not (no mock numbers).
4. Undesigned screens listed in §5.
