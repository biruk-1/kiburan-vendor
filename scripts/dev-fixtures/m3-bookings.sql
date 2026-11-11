-- LOCAL DEVELOPMENT ONLY. Never run against a hosted project.
-- Temporary rows used to check the Milestone 3 booking/review UI for "Lumen & Lace Studio"
-- (seed vendor 22222222-2222-4222-8222-222222222221). Every row uses an ffffffff-… id and is
-- removed by m3-bookings-cleanup.sql. Runs as the database owner, so RLS is not involved.
begin;

with inquiry as (
  select id, wedding_id, created_by
  from public.vendor_inquiries
  where vendor_id = '22222222-2222-4222-8222-222222222221'
  order by created_at desc
  limit 1
)
insert into public.wedding_vendors (id, wedding_id, vendor_id, status, notes)
select 'ffffffff-0003-4000-8000-000000000001', wedding_id, '22222222-2222-4222-8222-222222222221', 'booked', 'DEV FIXTURE (milestone 3 UI check)'
from inquiry;

insert into public.vendor_quotes (id, inquiry_id, package_id, amount, description, status)
select 'ffffffff-0003-4000-8000-000000000002', id, '0dd1bdbb-fa44-4fbe-9906-4751d4633ca2', 60000,
  'Full-day coverage from preparations to the last dance, with an online gallery.', 'accepted'
from public.vendor_inquiries
where vendor_id = '22222222-2222-4222-8222-222222222221'
order by created_at desc
limit 1;

insert into public.vendor_bookings (id, wedding_vendor_id, quote_id, booking_date, start_at, end_at, total_amount, deposit_amount, status, notes) values
  ('ffffffff-0003-4000-8000-000000000011', 'ffffffff-0003-4000-8000-000000000001', 'ffffffff-0003-4000-8000-000000000002',
    current_date + 20, (current_date + 20) + time '14:00', (current_date + 20) + time '23:00', 60000, 15000, 'pending', 'DEV FIXTURE'),
  ('ffffffff-0003-4000-8000-000000000012', 'ffffffff-0003-4000-8000-000000000001', 'ffffffff-0003-4000-8000-000000000002',
    date_trunc('month', current_date)::date + 25, null, null, 75000, null, 'confirmed', 'DEV FIXTURE'),
  ('ffffffff-0003-4000-8000-000000000013', 'ffffffff-0003-4000-8000-000000000001', null,
    current_date, now() - interval '1 hour', now() + interval '5 hours', 30000, null, 'confirmed', 'DEV FIXTURE'),
  ('ffffffff-0003-4000-8000-000000000014', 'ffffffff-0003-4000-8000-000000000001', 'ffffffff-0003-4000-8000-000000000002',
    (date_trunc('month', current_date) - interval '1 month')::date + 9, null, null, 50000, null, 'fulfilled', 'DEV FIXTURE'),
  ('ffffffff-0003-4000-8000-000000000015', 'ffffffff-0003-4000-8000-000000000001', null,
    current_date + 40, null, null, 20000, null, 'cancelled', 'DEV FIXTURE');

insert into public.vendor_reviews (id, vendor_id, wedding_id, reviewer_id, rating, comment, status)
select 'ffffffff-0003-4000-8000-000000000021', '22222222-2222-4222-8222-222222222221', wedding_id, created_by, 5, 'DEV FIXTURE', 'published'
from public.vendor_inquiries
where vendor_id = '22222222-2222-4222-8222-222222222221'
order by created_at desc
limit 1;

commit;
