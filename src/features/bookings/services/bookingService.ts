import {
  FILTER_STATUS,
  parseBookingStatus,
  type BookingFilter,
  type BookingStatus,
} from '@/features/bookings/utils/bookingStatus';
import type { CoupleProjection } from '@/features/inquiries/services/inquiryService';
import { mapDataError, type ServiceResult } from '@/lib/query/queryError';
import { supabase } from '@/lib/supabase/client';

export const BOOKING_PAGE_SIZE = 20;

export type Booking = {
  id: string;
  status: BookingStatus;
  bookingDate: string | null;
  startAt: string | null;
  endAt: string | null;
  totalAmount: number | null;
  depositAmount: number | null;
  currencyCode: string;
  notes: string | null;
  hasContract: boolean;
  createdAt: string;
  title: string;
  packageName: string | null;
  serviceId: string | null;
  serviceDescription: string | null;
  weddingId: string | null;
  couple: CoupleProjection;
};

export type BookingCursor = { createdAt: string; id: string };

export type BookingPage = {
  items: Booking[];
  nextCursor: BookingCursor | null;
};

function parseCouple(raw: unknown): CoupleProjection {
  const row = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    weddingTitle: typeof row.wedding_title === 'string' ? row.wedding_title : null,
    coupleLabel: typeof row.couple_label === 'string' ? row.couple_label : null,
    celebrationKind: typeof row.celebration_kind === 'string' ? row.celebration_kind : null,
    weddingDate: typeof row.wedding_date === 'string' ? row.wedding_date : null,
    city: typeof row.city === 'string' ? row.city : null,
    inquirerDisplayName: typeof row.inquirer_display_name === 'string' ? row.inquirer_display_name : null,
    contactPhone: typeof row.contact_phone === 'string' ? row.contact_phone : null,
    contactEmail: typeof row.contact_email === 'string' ? row.contact_email : null,
  };
}

function parseBooking(raw: Record<string, unknown>): Booking {
  return {
    id: String(raw.id),
    status: parseBookingStatus(String(raw.status ?? 'pending')),
    bookingDate: typeof raw.booking_date === 'string' ? raw.booking_date : null,
    startAt: typeof raw.start_at === 'string' ? raw.start_at : null,
    endAt: typeof raw.end_at === 'string' ? raw.end_at : null,
    totalAmount: raw.total_amount == null ? null : Number(raw.total_amount),
    depositAmount: raw.deposit_amount == null ? null : Number(raw.deposit_amount),
    currencyCode: typeof raw.currency_code === 'string' ? raw.currency_code : 'ETB',
    notes: typeof raw.notes === 'string' ? raw.notes : null,
    hasContract: Boolean(raw.has_contract),
    createdAt: String(raw.created_at),
    title: typeof raw.service_title === 'string' ? raw.service_title : 'Booking',
    packageName: typeof raw.package_name === 'string' ? raw.package_name : null,
    serviceId: typeof raw.service_id === 'string' ? raw.service_id : null,
    serviceDescription: typeof raw.service_description === 'string' ? raw.service_description : null,
    weddingId: typeof raw.wedding_id === 'string' ? raw.wedding_id : null,
    couple: parseCouple(raw.couple),
  };
}

function parsePage(raw: unknown): BookingPage {
  const row = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const itemsRaw = Array.isArray(row.items) ? row.items : [];
  const cursor = row.next_cursor && typeof row.next_cursor === 'object' ? (row.next_cursor as Record<string, unknown>) : null;
  return {
    items: itemsRaw
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .map(parseBooking),
    nextCursor:
      cursor && typeof cursor.created_at === 'string' && typeof cursor.id === 'string'
        ? { createdAt: cursor.created_at, id: cursor.id }
        : null,
  };
}

export async function listBookings(
  vendorId: string,
  filter: BookingFilter,
  cursor: BookingCursor | null,
): Promise<ServiceResult<BookingPage>> {
  const { data, error } = await supabase.rpc('vendor_list_bookings', {
    p_vendor_id: vendorId,
    p_status: filter === 'all' ? undefined : FILTER_STATUS[filter],
    p_limit: BOOKING_PAGE_SIZE,
    p_cursor_created_at: cursor?.createdAt,
    p_cursor_id: cursor?.id,
  });
  if (error) return { ok: false, error: mapDataError(error) };
  return { ok: true, data: parsePage(data) };
}

export async function getBookingStatuses(vendorId: string): Promise<ServiceResult<BookingStatus[]>> {
  // Counts still come from a lightweight direct query (team can SELECT bookings).
  const { data, error } = await supabase
    .from('vendor_bookings')
    .select('status, wedding_vendor:wedding_vendors!inner ( vendor_id )')
    .eq('wedding_vendor.vendor_id', vendorId);
  if (error) return { ok: false, error: mapDataError(error) };
  return { ok: true, data: (data ?? []).map((row) => parseBookingStatus(row.status)) };
}

export async function getBooking(vendorId: string, bookingId: string): Promise<ServiceResult<Booking | null>> {
  const { data, error } = await supabase.rpc('vendor_get_booking', { p_booking_id: bookingId });
  if (error) return { ok: false, error: mapDataError(error) };
  if (!data || typeof data !== 'object') return { ok: true, data: null };
  const row = data as Record<string, unknown>;
  if (typeof row.vendor_id === 'string' && row.vendor_id !== vendorId) {
    return { ok: true, data: null };
  }
  return { ok: true, data: parseBooking(row) };
}

export async function respondToBooking(
  bookingId: string,
  action: 'confirm' | 'decline' | 'fulfil',
  note?: string | null,
): Promise<ServiceResult<Booking>> {
  const { data, error } = await supabase.rpc('vendor_respond_booking', {
    p_booking_id: bookingId,
    p_action: action,
    p_note: note ?? undefined,
  });
  if (error) return { ok: false, error: mapBookingError(error) };
  if (!data || typeof data !== 'object') {
    return { ok: false, error: { code: 'unknown', message: 'Booking update returned no data.' } };
  }
  return { ok: true, data: parseBooking(data as Record<string, unknown>) };
}

/** Distinct couples (weddings) with at least one fulfilled booking. */
export async function countClients(vendorId: string): Promise<ServiceResult<number>> {
  const { data, error } = await supabase
    .from('vendor_bookings')
    .select('wedding_vendor:wedding_vendors!inner ( vendor_id, wedding_id )')
    .eq('wedding_vendor.vendor_id', vendorId)
    .eq('status', 'fulfilled');
  if (error) return { ok: false, error: mapDataError(error) };
  const weddings = new Set<string>();
  for (const row of data ?? []) {
    const link = row.wedding_vendor as { wedding_id: string } | { wedding_id: string }[] | null;
    const weddingId = Array.isArray(link) ? link[0]?.wedding_id : link?.wedding_id;
    if (weddingId) weddings.add(weddingId);
  }
  return { ok: true, data: weddings.size };
}

function mapBookingError(error: { message?: string; code?: string; name?: string } | Error | null) {
  const message = (('message' in (error ?? {}) ? (error as { message?: string }).message : '') ?? '').toLowerCase();
  if (message.includes('only owners and managers')) {
    return { code: 'forbidden', message: 'Only owners and managers can respond to bookings.' };
  }
  if (message.includes('only pending') || message.includes('only confirmed')) {
    return { code: 'validation', message: 'That action is not available for this booking status.' };
  }
  return mapDataError(error);
}
