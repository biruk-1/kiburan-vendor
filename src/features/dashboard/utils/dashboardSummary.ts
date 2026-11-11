import { VALUE_MONTHS, type BookingValueSummary } from '@/features/dashboard/utils/bookingValue';

export type SummaryPayload = {
  new_inquiries: number;
  active_bookings: number;
  review_count: number;
  review_average: number | null;
  currency_code: string;
  booking_value_this_month: number;
  booking_value_last_month: number;
  booking_value_series: number[];
  has_other_currencies: boolean;
};

/** Parses the JSON from `vendor_dashboard_summary` without inventing missing fields. */
export function parseDashboardSummary(raw: unknown): SummaryPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const seriesRaw = row.booking_value_series;
  if (!Array.isArray(seriesRaw) || seriesRaw.length !== VALUE_MONTHS) return null;
  const series = seriesRaw.map((value) => Number(value));
  if (series.some((value) => Number.isNaN(value))) return null;

  const numbers = {
    new_inquiries: Number(row.new_inquiries),
    active_bookings: Number(row.active_bookings),
    review_count: Number(row.review_count),
    booking_value_this_month: Number(row.booking_value_this_month),
    booking_value_last_month: Number(row.booking_value_last_month),
  };
  if (Object.values(numbers).some((value) => Number.isNaN(value))) return null;

  const reviewAverage =
    row.review_average === null || row.review_average === undefined ? null : Number(row.review_average);
  if (reviewAverage !== null && Number.isNaN(reviewAverage)) return null;

  return {
    ...numbers,
    review_average: reviewAverage,
    currency_code: typeof row.currency_code === 'string' ? row.currency_code : 'ETB',
    booking_value_series: series,
    has_other_currencies: Boolean(row.has_other_currencies),
  };
}

export function bookingValueFromSummary(summary: SummaryPayload): BookingValueSummary {
  const thisMonth = summary.booking_value_this_month;
  const lastMonth = summary.booking_value_last_month;
  return {
    currencyCode: summary.currency_code,
    thisMonth,
    lastMonth,
    series: summary.booking_value_series,
    changePercent: lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null,
    hasOtherCurrencies: summary.has_other_currencies,
  };
}
