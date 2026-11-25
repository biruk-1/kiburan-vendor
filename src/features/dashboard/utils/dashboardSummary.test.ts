import { describe, expect, it } from 'vitest';

import { parseDashboardSummary } from '@/features/dashboard/utils/dashboardSummary';

describe('parseDashboardSummary', () => {
  it('accepts a complete RPC payload', () => {
    const parsed = parseDashboardSummary({
      new_inquiries: 2,
      active_bookings: 3,
      review_count: 4,
      review_average: 4.5,
      currency_code: 'ETB',
      booking_value_this_month: 1000,
      booking_value_last_month: 500,
      booking_value_series: [0, 0, 0, 0, 500, 1000],
      has_other_currencies: false,
    });
    expect(parsed).toEqual({
      new_inquiries: 2,
      pending_bookings: 0,
      active_bookings: 3,
      review_count: 4,
      review_average: 4.5,
      currency_code: 'ETB',
      booking_value_this_month: 1000,
      booking_value_last_month: 500,
      booking_value_series: [0, 0, 0, 0, 500, 1000],
      has_other_currencies: false,
    });
  });

  it('reads pending_bookings when the RPC includes it', () => {
    const parsed = parseDashboardSummary({
      new_inquiries: 1,
      pending_bookings: 5,
      active_bookings: 5,
      review_count: 0,
      review_average: null,
      currency_code: 'ETB',
      booking_value_this_month: 0,
      booking_value_last_month: 0,
      booking_value_series: [0, 0, 0, 0, 0, 0],
      has_other_currencies: false,
    });
    expect(parsed?.pending_bookings).toBe(5);
  });


  it('rejects incomplete or malformed payloads instead of inventing numbers', () => {
    expect(parseDashboardSummary(null)).toBeNull();
    expect(parseDashboardSummary({ new_inquiries: 1 })).toBeNull();
    expect(
      parseDashboardSummary({
        new_inquiries: 1,
        active_bookings: 1,
        review_count: 0,
        review_average: null,
        currency_code: 'ETB',
        booking_value_this_month: 0,
        booking_value_last_month: 0,
        booking_value_series: [0, 0, 0],
        has_other_currencies: false,
      }),
    ).toBeNull();
  });
});
