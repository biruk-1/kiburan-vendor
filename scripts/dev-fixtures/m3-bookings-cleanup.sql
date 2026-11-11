-- Removes every row created by m3-bookings.sql.
begin;
delete from public.vendor_reviews where id = 'ffffffff-0003-4000-8000-000000000021';
delete from public.vendor_bookings where id::text like 'ffffffff-0003-4000-8000-%';
delete from public.vendor_quotes where id = 'ffffffff-0003-4000-8000-000000000002';
delete from public.wedding_vendors where id = 'ffffffff-0003-4000-8000-000000000001';
commit;
