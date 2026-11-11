import { mapDataError, type ServiceResult } from '@/lib/query/queryError';
import { supabase } from '@/lib/supabase/client';

export const REVIEW_PAGE_SIZE = 20;

export type ReviewStatus = 'published' | 'pending' | 'hidden';

export type ReviewSummary = { average: number | null; count: number };

export type ReviewCouple = {
  coupleLabel: string | null;
  weddingTitle: string | null;
  city: string | null;
  weddingDate: string | null;
};

export type ReviewListItem = {
  id: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: string;
  weddingId: string;
  reviewerId: string;
  reviewerDisplayName: string | null;
  couple: ReviewCouple;
};

export type ReviewCursor = { createdAt: string; id: string };

export type ReviewPage = {
  items: ReviewListItem[];
  nextCursor: ReviewCursor | null;
  publishedCount: number;
  publishedAverage: number | null;
  pendingCount: number;
};

const STATUSES: readonly ReviewStatus[] = ['published', 'pending', 'hidden'];

function parseStatus(value: string): ReviewStatus {
  return (STATUSES as readonly string[]).includes(value) ? (value as ReviewStatus) : 'pending';
}

function parseCouple(raw: unknown): ReviewCouple {
  const row = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    coupleLabel: typeof row.couple_label === 'string' ? row.couple_label : null,
    weddingTitle: typeof row.wedding_title === 'string' ? row.wedding_title : null,
    city: typeof row.city === 'string' ? row.city : null,
    weddingDate: typeof row.wedding_date === 'string' ? row.wedding_date : null,
  };
}

function parseItem(raw: Record<string, unknown>): ReviewListItem {
  return {
    id: String(raw.id),
    rating: Number(raw.rating),
    comment: typeof raw.comment === 'string' ? raw.comment : null,
    status: parseStatus(String(raw.status ?? 'pending')),
    createdAt: String(raw.created_at),
    weddingId: String(raw.wedding_id),
    reviewerId: String(raw.reviewer_id),
    reviewerDisplayName: typeof raw.reviewer_display_name === 'string' ? raw.reviewer_display_name : null,
    couple: parseCouple(raw.couple),
  };
}

function parsePage(raw: unknown): ReviewPage {
  const row = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const itemsRaw = Array.isArray(row.items) ? row.items : [];
  const cursor = row.next_cursor && typeof row.next_cursor === 'object' ? (row.next_cursor as Record<string, unknown>) : null;
  const publishedAverage =
    row.published_average === null || row.published_average === undefined ? null : Number(row.published_average);
  return {
    items: itemsRaw
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .map(parseItem),
    nextCursor:
      cursor && typeof cursor.created_at === 'string' && typeof cursor.id === 'string'
        ? { createdAt: cursor.created_at, id: cursor.id }
        : null,
    publishedCount: Number(row.published_count ?? 0),
    publishedAverage: publishedAverage !== null && Number.isNaN(publishedAverage) ? null : publishedAverage,
    pendingCount: Number(row.pending_count ?? 0),
  };
}

/**
 * Only `published` reviews count, so the vendor sees the same rating couples see.
 * Vendors can also read pending/hidden reviews under RLS; those are excluded here.
 */
export async function getReviewSummary(vendorId: string): Promise<ServiceResult<ReviewSummary>> {
  const page = await listReviews(vendorId, 'published', null);
  if (!page.ok) return page;
  return {
    ok: true,
    data: { average: page.data.publishedAverage, count: page.data.publishedCount },
  };
}

export async function listReviews(
  vendorId: string,
  status: ReviewStatus,
  cursor: ReviewCursor | null,
): Promise<ServiceResult<ReviewPage>> {
  const { data, error } = await supabase.rpc('vendor_list_reviews', {
    p_vendor_id: vendorId,
    p_status: status,
    p_limit: REVIEW_PAGE_SIZE,
    p_cursor_created_at: cursor?.createdAt,
    p_cursor_id: cursor?.id,
  });
  if (error) return { ok: false, error: mapDataError(error) };
  return { ok: true, data: parsePage(data) };
}
