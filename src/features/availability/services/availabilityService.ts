import { mapDataError, type ServiceResult } from '@/lib/query/queryError';
import { supabase } from '@/lib/supabase/client';

export type AvailabilityStatus = 'available' | 'unavailable' | 'tentative' | 'booked';

export type AvailabilityWindow = {
  id: string;
  serviceId: string | null;
  startsAt: string;
  endsAt: string;
  status: AvailabilityStatus;
  notes: string | null;
};

export type AvailabilityInput = {
  serviceId: string | null;
  startsAt: string;
  endsAt: string;
  status: AvailabilityStatus;
  notes: string | null;
};

const STATUSES: readonly AvailabilityStatus[] = ['available', 'unavailable', 'tentative', 'booked'];

function parseStatus(value: string): AvailabilityStatus {
  return (STATUSES as readonly string[]).includes(value) ? (value as AvailabilityStatus) : 'unavailable';
}

export async function listAvailability(
  vendorId: string,
  fromIso: string,
): Promise<ServiceResult<AvailabilityWindow[]>> {
  const { data, error } = await supabase
    .from('vendor_availability')
    .select('id, service_id, starts_at, ends_at, status, notes')
    .eq('vendor_id', vendorId)
    .gte('ends_at', fromIso)
    .order('starts_at', { ascending: true })
    .limit(200);
  if (error) return { ok: false, error: mapDataError(error) };
  return {
    ok: true,
    data: (data ?? []).map((row) => ({
      id: row.id,
      serviceId: row.service_id,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      status: parseStatus(row.status),
      notes: row.notes,
    })),
  };
}

export async function createAvailability(
  vendorId: string,
  input: AvailabilityInput,
): Promise<ServiceResult<{ id: string }>> {
  const { data, error } = await supabase
    .from('vendor_availability')
    .insert({
      vendor_id: vendorId,
      service_id: input.serviceId,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      status: input.status,
      notes: input.notes,
    })
    .select('id')
    .single();
  if (error) return { ok: false, error: mapAvailabilityError(error) };
  return { ok: true, data };
}

export async function updateAvailability(
  vendorId: string,
  windowId: string,
  input: AvailabilityInput,
): Promise<ServiceResult<true>> {
  const { error, count } = await supabase
    .from('vendor_availability')
    .update(
      {
        service_id: input.serviceId,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        status: input.status,
        notes: input.notes,
      },
      { count: 'exact' },
    )
    .eq('vendor_id', vendorId)
    .eq('id', windowId);
  if (error) return { ok: false, error: mapAvailabilityError(error) };
  if (count === 0) return { ok: false, error: { code: 'forbidden', message: "You can't edit this window." } };
  return { ok: true, data: true };
}

export async function deleteAvailability(vendorId: string, windowId: string): Promise<ServiceResult<true>> {
  const { error, count } = await supabase
    .from('vendor_availability')
    .delete({ count: 'exact' })
    .eq('vendor_id', vendorId)
    .eq('id', windowId);
  if (error) return { ok: false, error: mapDataError(error) };
  if (count === 0) return { ok: false, error: { code: 'forbidden', message: "You can't delete this window." } };
  return { ok: true, data: true };
}

function mapAvailabilityError(error: { message?: string; code?: string; name?: string } | Error | null) {
  const message = (('message' in (error ?? {}) ? (error as { message?: string }).message : '') ?? '').toLowerCase();
  if (message.includes('ends_at') || message.includes('check')) {
    return { code: 'validation', message: 'End time must be after the start time.' };
  }
  return mapDataError(error);
}
