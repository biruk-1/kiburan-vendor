-- LOCAL DEVELOPMENT ONLY. Durable M8 smoke fixtures for Lumen & Lace Studio.
-- Uses the existing "Tsehay & Daniel Smoke" wedding from M7 when present.
-- Ids are ffffffff-0008-… so they can be cleaned without touching seed data.
-- vendor_reviews is unique per (vendor_id, wedding_id), so pending uses a second wedding.

begin;

do $$
declare
  v_vendor uuid := '22222222-2222-4222-8222-222222222221';
  v_wedding uuid;
  v_couple uuid;
  v_wv uuid := 'ffffffff-0008-4000-8000-000000000001';
  v_pending_wedding uuid := 'ffffffff-0008-4000-8000-000000000030';
begin
  select i.wedding_id, i.created_by into v_wedding, v_couple
  from public.vendor_inquiries i
  join public.weddings w on w.id = i.wedding_id
  where i.vendor_id = v_vendor
    and w.title = 'Tsehay & Daniel Smoke'
  order by i.created_at desc
  limit 1;

  if v_wedding is null then
    raise exception 'M7 smoke wedding missing — insert M7 inquiry fixtures first';
  end if;

  insert into public.wedding_vendors (id, wedding_id, vendor_id, status, notes)
  values (v_wv, v_wedding, v_vendor, 'booked', 'M8 smoke fixture')
  on conflict (id) do update set notes = excluded.notes, status = excluded.status;

  insert into public.vendor_bookings (
    id, wedding_vendor_id, booking_date, total_amount, deposit_amount, currency_code, status, notes
  ) values
    (
      'ffffffff-0008-4000-8000-000000000011', v_wv,
      current_date + 14, 42000, 10000, 'ETB', 'pending', 'M8 smoke fixture'
    ),
    (
      'ffffffff-0008-4000-8000-000000000012', v_wv,
      date_trunc('month', current_date)::date + 12, 68000, 15000, 'ETB', 'confirmed', 'M8 smoke fixture'
    ),
    (
      'ffffffff-0008-4000-8000-000000000013', v_wv,
      (date_trunc('month', current_date) - interval '1 month')::date + 7, 45000, null, 'ETB', 'fulfilled',
      'M8 smoke fixture'
    )
  on conflict (id) do update
    set total_amount = excluded.total_amount,
        deposit_amount = excluded.deposit_amount,
        status = excluded.status,
        booking_date = excluded.booking_date,
        notes = excluded.notes;

  insert into public.weddings (
    id, created_by, title, partner_one_name, partner_two_name, wedding_date, city, celebration_kind
  ) values (
    v_pending_wedding, v_couple, 'M8 Pending Review Wedding', 'Hana Alemu', 'Abel Kebede',
    '2027-01-15', 'Addis Ababa', 'wedding'
  )
  on conflict (id) do update set title = excluded.title;

  insert into public.wedding_members (wedding_id, user_id, role)
  values (v_pending_wedding, v_couple, 'owner')
  on conflict do nothing;

  delete from public.vendor_reviews
  where vendor_id = v_vendor
    and wedding_id in (v_wedding, v_pending_wedding);

  insert into public.vendor_reviews (id, vendor_id, wedding_id, reviewer_id, rating, comment, status)
  values
    (
      'ffffffff-0008-4000-8000-000000000021', v_vendor, v_wedding, v_couple, 5,
      'M8 smoke published review — beautiful full-day coverage.', 'published'
    ),
    (
      'ffffffff-0008-4000-8000-000000000022', v_vendor, v_pending_wedding, v_couple, 4,
      'M8 smoke pending review — awaiting moderation.', 'pending'
    );
end;
$$;

commit;
