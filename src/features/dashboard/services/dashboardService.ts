import {
  bookingValueFromSummary,
  parseDashboardSummary,
} from '@/features/dashboard/utils/dashboardSummary';
import type { BookingValueSummary } from '@/features/dashboard/utils/bookingValue';
import { mapDataError, type ServiceResult } from '@/lib/query/queryError';
import { supabase } from '@/lib/supabase/client';
import { one } from '@/lib/supabase/embed';

export type ActivityKind = 'inquiry' | 'booking' | 'review';

export type Activity = {
  id: string;
  kind: ActivityKind;
  title: string;
  createdAt: string;
  /** Booking id for booking rows; inquiries and reviews have no screen yet. */
  bookingId: string | null;
};

export type DashboardData = {
  newInquiries: number;
  activeBookings: number;
  reviewAverage: number | null;
  reviewCount: number;
  bookingValue: BookingValueSummary;
  activity: Activity[];
};

const ACTIVITY_LIMIT = 5;

/** Counts and booking value come from one RPC; recent activity stays as light list queries. */
export async function getDashboard(vendorId: string): Promise<ServiceResult<DashboardData>> {
  const [summaryResult, recentInquiries, recentBookings, recentReviews] = await Promise.all([
    supabase.rpc('vendor_dashboard_summary', { p_vendor_id: vendorId }),
    supabase
      .from('vendor_inquiries')
      .select('id, created_at, service:vendor_services ( title )')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(ACTIVITY_LIMIT),
    supabase
      .from('vendor_bookings')
      .select('id, created_at, status, wedding_vendor:wedding_vendors!inner ( vendor_id )')
      .eq('wedding_vendor.vendor_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(ACTIVITY_LIMIT),
    supabase
      .from('vendor_reviews')
      .select('id, created_at, rating')
      .eq('vendor_id', vendorId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(ACTIVITY_LIMIT),
  ]);

  if (summaryResult.error) return { ok: false, error: mapDataError(summaryResult.error) };
  for (const result of [recentInquiries, recentBookings, recentReviews]) {
    if (result.error) return { ok: false, error: mapDataError(result.error) };
  }

  const summary = parseDashboardSummary(summaryResult.data);
  if (!summary) {
    return { ok: false, error: { code: 'unknown', message: 'Dashboard summary was incomplete. Please try again.' } };
  }

  const activity: Activity[] = [
    ...(recentInquiries.data ?? []).map((row) => {
      const service = one(row.service as { title: string } | { title: string }[] | null);
      return {
        id: `inquiry-${row.id}`,
        kind: 'inquiry' as const,
        title: service ? `New inquiry for ${service.title}` : 'New inquiry',
        createdAt: row.created_at,
        bookingId: null,
      };
    }),
    ...(recentBookings.data ?? []).map((row) => ({
      id: `booking-${row.id}`,
      kind: 'booking' as const,
      // created_at is when the request arrived; there is no timestamp for later status changes.
      title: 'New booking request',
      createdAt: row.created_at,
      bookingId: row.id,
    })),
    ...(recentReviews.data ?? []).map((row) => ({
      id: `review-${row.id}`,
      kind: 'review' as const,
      title: `New ${row.rating}-star review`,
      createdAt: row.created_at,
      bookingId: null,
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, ACTIVITY_LIMIT);

  return {
    ok: true,
    data: {
      newInquiries: summary.new_inquiries,
      activeBookings: summary.active_bookings,
      reviewAverage: summary.review_average,
      reviewCount: summary.review_count,
      bookingValue: bookingValueFromSummary(summary),
      activity,
    },
  };
}
