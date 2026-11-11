# 01 — Existing vendor database schema

Sources inspected:

- `kiburan/reference/kiburan_schema.sql` (PM original, unchanged)
- `kiburan/supabase/migrations/*` (13 migrations, baseline `20260325120000_pm_baseline.sql` is a verbatim copy of the reference schema)
- `kiburan/src/types/database.types.ts` (generated types used by the client)
- `kiburan/supabase/seed.sql`

No migration after the baseline adds or alters a vendor table column. All vendor tables below are exactly as in the reference schema. Later migrations only changed **wedding-side** RLS on `wedding_vendors`, `vendor_inquiries`, and `vendor_bookings` (see `03-rls-security-and-storage.md`).

## Entity map

```
auth.users ──1:1── profiles
                     │
                     ├── vendors.owner_user_id ─────────────┐
                     └── vendor_team_members.user_id         │
                                                             ▼
vendor_categories ◄── vendor_category_memberships ──► vendors ◄── vendor_reviews ──► weddings
        ▲                                               │  ▲
        └──────────── vendor_services.category_id ◄─────┤  └── vendor_inquiries ──► weddings, wedding_events, profiles(created_by)
                           │                            │            │
                           ├── vendor_packages          │            └── vendor_quotes ──► vendor_packages
                           ├── vendor_media ◄───────────┤                     │
                           └── vendor_availability ◄────┘                     ▼
                                                     wedding_vendors ◄── vendor_bookings (quote_id optional)
                                                     (wedding_id, vendor_id)        │
                                                                                    ├── budget_items.booking_id ── expense_payments
                                                                                    └── wedding_files.booking_id
```

## Tables

### `profiles`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK → `auth.users.id` (cascade) | Created by `private.handle_new_user()` trigger on sign-up |
| `display_name` | text not null default `''` | From `raw_user_meta_data.display_name` |
| `phone`, `avatar_url` | text | |
| `preferred_language` | `en` \| `am` | |
| `created_at`, `updated_at` | timestamptz | `updated_at` trigger |

There is **no role / account-type column**. Nothing distinguishes a "vendor user" from a "couple user" at the profile level. Vendor identity is derived only from `vendors.owner_user_id` and `vendor_team_members`.

### `vendor_categories` (lookup)

`id`, `slug` (unique), `name_en`, `name_am`. Read-only to clients. Seeded slugs include `photographer`, `venue`, `caterer`, `florist` and others in `seed.sql`.

### `vendors`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `owner_user_id` | uuid not null → `profiles` | Single legal owner |
| `business_name` | text not null | |
| `slug` | text not null **unique** | Client must generate on create |
| `description`, `phone`, `email`, `website_url`, `instagram_url` | text | |
| `city`, `address` | text | No geo columns, no service-area column |
| `country_code` | char(2) default `ET` | |
| `logo_url`, `cover_url` | text | No storage bucket backs these yet |
| `verification_status` | `unverified` \| `pending` \| `verified` \| `rejected` (default `unverified`) | |
| `listing_status` | `draft` \| `published` \| `suspended` (default `draft`) | |
| `created_at`, `updated_at` | timestamptz | `updated_at` trigger |

Marketplace visibility = `listing_status = 'published' AND verification_status = 'verified'`.

Not present: years of experience, service areas, opening hours, languages, rejection reason, submitted_at / verified_at timestamps, social links beyond Instagram, tax/licence details.

### `vendor_team_members`

| Column | Notes |
| --- | --- |
| `vendor_id` → `vendors` (cascade) | PK part |
| `user_id` → `profiles` (cascade) | PK part |
| `role` | `owner` \| `manager` \| `staff` (default `staff`) |

No `invited_by`, `created_at`, status, or invitation table. Membership is a direct row; there is no pending-invite concept. The vendor owner (`vendors.owner_user_id`) is **not** automatically inserted here — the helper functions treat the owner as a member regardless.

### `vendor_category_memberships`

`(vendor_id, category_id)` PK. Many-to-many vendor ↔ category.

### `vendor_services`

| Column | Notes |
| --- | --- |
| `vendor_id` → `vendors` (cascade) | |
| `category_id` → `vendor_categories` (set null) | |
| `title` not null, `description` | |
| `base_price` numeric(14,2) ≥ 0, nullable | "Starting price" |
| `currency_code` default `ETB` | |
| `price_unit` | `package` \| `hour` \| `day` \| `person` \| `item` \| `custom` |
| `is_active` default true | Activate / deactivate listing |
| `created_at` | No `updated_at`, no `sort_order`, no cover image column |

### `vendor_packages`

`service_id` → `vendor_services` (cascade), `name`, `description`, `inclusions` jsonb array (default `[]`), `price` ≥ 0, `currency_code`, `is_active`. No `created_at`, no `sort_order`. Packages belong to a **service**, not directly to a vendor.

### `vendor_media`

`vendor_id`, optional `service_id` (trigger enforces same vendor), `storage_path` not null, `media_type` `image` \| `video`, `caption`, `sort_order`. No `created_at`. The client currently renders only rows whose `storage_path` is an `https://` URL (seed uses Unsplash URLs). Service photos ("Upload Photos" in the design) map to `vendor_media.service_id`.

### `vendor_availability`

`vendor_id`, optional `service_id` (same-vendor trigger), `starts_at`, `ends_at` (check `ends_at > starts_at`), `status` `available` \| `unavailable` \| `tentative` \| `booked`, `notes`. No overlap exclusion constraint and no link to `vendor_bookings`.

### `wedding_vendors` (couple-side vendor link)

`wedding_id`, optional `event_id` (same-wedding trigger), optional `vendor_id` (marketplace) **or** `external_business_name` / `external_phone` (outside supplier), `category_id`, `notes` (couple's private notes), `status` `shortlisted` \| `contacted` \| `negotiating` \| `booked` \| `completed` \| `cancelled`, `created_at`.

This is the couple's planning record. The client creates it with `status = 'shortlisted'` when a couple saves a vendor. `vendor_bookings` hangs off this row, not off `vendors` directly.

### `vendor_inquiries`

`wedding_id`, `vendor_id`, optional `service_id` (same-vendor trigger), optional `requested_event_id` (same-wedding trigger), `message`, `proposed_budget`, `status` `new` \| `replied` \| `quoted` \| `accepted` \| `declined` \| `closed`, `created_by` → `profiles`, `created_at`. No `updated_at`, no reply/response column, no event date column (date only via `requested_event_id`).

### `vendor_quotes`

`inquiry_id` (cascade), optional `package_id` (trigger: package's vendor = inquiry's vendor), `amount` not null, `currency_code`, `description`, `valid_until` date, `status` `draft` \| `sent` \| `accepted` \| `rejected` \| `expired`, `created_at`. No `created_by`, no `updated_at`.

### `vendor_bookings`

| Column | Notes |
| --- | --- |
| `wedding_vendor_id` → `wedding_vendors` (cascade) | Booking ties to the couple's vendor link |
| `quote_id` → `vendor_quotes` | Optional; **no** trigger checks quote vendor = booking vendor |
| `booking_date` date, `start_at`, `end_at` | |
| `total_amount`, `deposit_amount` | Agreed amounts. `deposit_amount ≤ total_amount`. **Not payments.** |
| `currency_code` | |
| `status` | `pending` \| `confirmed` \| `fulfilled` \| `cancelled` |
| `contract_storage_path` | No bucket backs this |
| `notes` | Single shared notes field (no vendor-private notes) |
| `created_at` | No `updated_at`, no status history |

There is no "declined/rejected" booking status. Rejecting a request must map to `cancelled` (or be handled at inquiry level with `declined`).

### `vendor_reviews`

`vendor_id`, `wedding_id`, `reviewer_id`, `rating` 1–5, `comment`, `status` `pending` \| `published` \| `hidden`, `created_at`, unique `(vendor_id, wedding_id)`. No vendor reply column.

### Payment tables (relevant to earnings)

- `budget_items.booking_id` → `vendor_bookings` (couple's budget line)
- `expense_payments` (`budget_item_id`, `amount`, `paid_at`, `payment_method`, `reference`, `receipt_storage_path`, `recorded_by`)

These are **couple-recorded** payments in the couple's budget. They are not vendor-confirmed receipts and are not readable by vendors under current RLS.

## Indexes relevant to vendor queries

Existing: `idx_vendor_search (city, listing_status, verification_status)`, `idx_vendor_services_vendor`, `idx_vendor_availability (vendor_id, starts_at, ends_at)`, `idx_vendor_inquiries_vendor (vendor_id, status)`, `idx_vendor_inquiries_wedding`, `idx_vendor_team_members_user`, `idx_vendors_owner`, `idx_wedding_vendors_wedding (wedding_id, status)`, unique `(vendor_id, wedding_id)` on reviews.

Missing for vendor-side access paths: `wedding_vendors(vendor_id)`, `vendor_bookings(wedding_vendor_id)`, `vendor_quotes(inquiry_id)`, `vendor_media(vendor_id, sort_order)`, `vendor_packages(service_id)`, `vendor_inquiries(vendor_id, created_at desc)`.

## Triggers touching vendor tables

| Trigger | Effect |
| --- | --- |
| `vendors_set_updated_at` | Maintains `vendors.updated_at` |
| `vendors_protect_verification` | Blocks **UPDATE** of `verification_status` by non-service-role clients. Does not cover INSERT. |
| `vendor_inquiries_same_wedding_event` | `requested_event_id` must belong to `wedding_id` |
| `vendor_inquiries_service_vendor` | `service_id` must belong to `vendor_id` |
| `vendor_quotes_package_vendor` | Quote package must belong to inquiry's vendor |
| `vendor_media_service_vendor`, `vendor_availability_service_vendor` | `service_id` must belong to `vendor_id` |
| `wedding_vendors_same_wedding_event` | `event_id` must belong to `wedding_id` |
| `budget_items_same_wedding` | Booking's wedding must equal budget item's wedding (checked only when the budget item changes) |

No trigger enforces booking/inquiry/quote status transitions, and nothing syncs inquiry ↔ quote ↔ booking ↔ `wedding_vendors.status` ↔ availability.

## Seed data (local only)

`seed.sql` creates `marketplace.seed@kiburan.local` (password in seed) owning four published + verified vendors with services, packages, Unsplash media, and `vendor_team_members` rows with role `owner`. No inquiries, quotes, bookings, or reviews are seeded. This account is the natural first test login for the vendor app locally.
