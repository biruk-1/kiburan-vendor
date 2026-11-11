import { mapDataError, type ServiceResult } from '@/lib/query/queryError';
import { supabase } from '@/lib/supabase/client';

export const INQUIRY_PAGE_SIZE = 20;

export type InquiryStatus = 'new' | 'replied' | 'quoted' | 'accepted' | 'declined' | 'closed';

export type CoupleProjection = {
  weddingTitle: string | null;
  coupleLabel: string | null;
  celebrationKind: string | null;
  weddingDate: string | null;
  city: string | null;
  inquirerDisplayName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
};

export type InquiryListItem = {
  id: string;
  status: InquiryStatus;
  message: string | null;
  proposedBudget: number | null;
  createdAt: string;
  serviceId: string | null;
  serviceTitle: string | null;
  weddingId: string;
  eventName: string | null;
  eventStartsAt: string | null;
  eventVenueName: string | null;
  couple: CoupleProjection;
};

export type InquiryQuote = {
  id: string;
  amount: number;
  currencyCode: string;
  description: string | null;
  packageId: string | null;
  packageName: string | null;
  status: string;
  validUntil: string | null;
  createdAt: string;
};

export type InquiryDetail = InquiryListItem & {
  vendorId: string;
  quotes: InquiryQuote[];
};

export type InquiryCursor = { createdAt: string; id: string };

export type InquiryPage = {
  items: InquiryListItem[];
  nextCursor: InquiryCursor | null;
};

const STATUSES: readonly InquiryStatus[] = ['new', 'replied', 'quoted', 'accepted', 'declined', 'closed'];

function parseStatus(value: string): InquiryStatus {
  return (STATUSES as readonly string[]).includes(value) ? (value as InquiryStatus) : 'new';
}

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

function parseListItem(raw: Record<string, unknown>): InquiryListItem {
  return {
    id: String(raw.id),
    status: parseStatus(String(raw.status ?? 'new')),
    message: typeof raw.message === 'string' ? raw.message : null,
    proposedBudget: raw.proposed_budget == null ? null : Number(raw.proposed_budget),
    createdAt: String(raw.created_at),
    serviceId: typeof raw.service_id === 'string' ? raw.service_id : null,
    serviceTitle: typeof raw.service_title === 'string' ? raw.service_title : null,
    weddingId: String(raw.wedding_id),
    eventName: typeof raw.event_name === 'string' ? raw.event_name : null,
    eventStartsAt: typeof raw.event_starts_at === 'string' ? raw.event_starts_at : null,
    eventVenueName: typeof raw.event_venue_name === 'string' ? raw.event_venue_name : null,
    couple: parseCouple(raw.couple),
  };
}

function parseQuote(raw: Record<string, unknown>): InquiryQuote {
  return {
    id: String(raw.id),
    amount: Number(raw.amount),
    currencyCode: typeof raw.currency_code === 'string' ? raw.currency_code : 'ETB',
    description: typeof raw.description === 'string' ? raw.description : null,
    packageId: typeof raw.package_id === 'string' ? raw.package_id : null,
    packageName: typeof raw.package_name === 'string' ? raw.package_name : null,
    status: String(raw.status ?? 'sent'),
    validUntil: typeof raw.valid_until === 'string' ? raw.valid_until : null,
    createdAt: String(raw.created_at),
  };
}

function parsePage(raw: unknown): InquiryPage {
  const row = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const itemsRaw = Array.isArray(row.items) ? row.items : [];
  const cursor = row.next_cursor && typeof row.next_cursor === 'object' ? (row.next_cursor as Record<string, unknown>) : null;
  return {
    items: itemsRaw
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .map(parseListItem),
    nextCursor:
      cursor && typeof cursor.created_at === 'string' && typeof cursor.id === 'string'
        ? { createdAt: cursor.created_at, id: cursor.id }
        : null,
  };
}

function parseDetail(raw: unknown): InquiryDetail | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const quotesRaw = Array.isArray(row.quotes) ? row.quotes : [];
  return {
    ...parseListItem(row),
    vendorId: String(row.vendor_id),
    quotes: quotesRaw
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .map(parseQuote),
  };
}

export async function listInquiries(
  vendorId: string,
  status: InquiryStatus | 'all',
  cursor: InquiryCursor | null,
): Promise<ServiceResult<InquiryPage>> {
  const { data, error } = await supabase.rpc('vendor_list_inquiries', {
    p_vendor_id: vendorId,
    p_status: status === 'all' ? undefined : status,
    p_limit: INQUIRY_PAGE_SIZE,
    p_cursor_created_at: cursor?.createdAt,
    p_cursor_id: cursor?.id,
  });
  if (error) return { ok: false, error: mapInquiryError(error) };
  return { ok: true, data: parsePage(data) };
}

export async function getInquiry(inquiryId: string): Promise<ServiceResult<InquiryDetail | null>> {
  const { data, error } = await supabase.rpc('vendor_get_inquiry', { p_inquiry_id: inquiryId });
  if (error) return { ok: false, error: mapInquiryError(error) };
  return { ok: true, data: parseDetail(data) };
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: 'replied' | 'declined' | 'closed',
): Promise<ServiceResult<InquiryDetail>> {
  const { data, error } = await supabase.rpc('vendor_update_inquiry_status', {
    p_inquiry_id: inquiryId,
    p_status: status,
  });
  if (error) return { ok: false, error: mapInquiryError(error) };
  const detail = parseDetail(data);
  if (!detail) return { ok: false, error: { code: 'unknown', message: 'Inquiry update returned no data.' } };
  return { ok: true, data: detail };
}

export async function sendQuote(input: {
  inquiryId: string;
  amount: number;
  packageId: string | null;
  description: string | null;
  validUntil: string | null;
}): Promise<ServiceResult<InquiryDetail>> {
  const { data, error } = await supabase.rpc('vendor_send_quote', {
    p_inquiry_id: input.inquiryId,
    p_amount: input.amount,
    p_package_id: input.packageId ?? undefined,
    p_description: input.description ?? undefined,
    p_valid_until: input.validUntil ?? undefined,
    p_currency_code: 'ETB',
  });
  if (error) return { ok: false, error: mapInquiryError(error) };
  const detail = parseDetail(data);
  if (!detail) return { ok: false, error: { code: 'unknown', message: 'Quote send returned no data.' } };
  return { ok: true, data: detail };
}

function mapInquiryError(error: { message?: string; code?: string; name?: string } | Error | null) {
  const message = (('message' in (error ?? {}) ? (error as { message?: string }).message : '') ?? '').toLowerCase();
  if (message.includes('only new inquiries')) {
    return { code: 'validation', message: 'Only new inquiries can be updated this way.' };
  }
  if (message.includes('only owners and managers can send quotes')) {
    return { code: 'forbidden', message: 'Only owners and managers can send quotes.' };
  }
  if (message.includes('declined or closed')) {
    return { code: 'validation', message: 'This inquiry is closed and cannot be quoted.' };
  }
  return mapDataError(error);
}
