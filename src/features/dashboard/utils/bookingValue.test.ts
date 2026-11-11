import { describe, expect, it } from 'vitest';

import { summarizeBookingValue } from '@/features/dashboard/utils/bookingValue';

const now = new Date(2026, 10, 6);

describe('summarizeBookingValue', () => {
  it('buckets ETB booking value by month and computes the change', () => {
    const summary = summarizeBookingValue(
      [
        { bookingDate: '2026-11-20', totalAmount: 60000, currencyCode: 'ETB' },
        { bookingDate: '2026-11-02', totalAmount: 15000, currencyCode: 'ETB' },
        { bookingDate: '2026-10-10', totalAmount: 50000, currencyCode: 'ETB' },
        { bookingDate: '2026-06-01', totalAmount: 10000, currencyCode: 'ETB' },
      ],
      now,
    );
    expect(summary.thisMonth).toBe(75000);
    expect(summary.lastMonth).toBe(50000);
    expect(summary.changePercent).toBe(50);
    expect(summary.series).toEqual([10000, 0, 0, 0, 50000, 75000]);
  });

  it('has no trend without a previous month, and ignores out-of-range rows', () => {
    const summary = summarizeBookingValue(
      [
        { bookingDate: '2026-11-20', totalAmount: 60000, currencyCode: 'ETB' },
        { bookingDate: '2025-01-01', totalAmount: 99999, currencyCode: 'ETB' },
        { bookingDate: null, totalAmount: 1, currencyCode: 'ETB' },
        { bookingDate: '2026-11-20', totalAmount: null, currencyCode: 'ETB' },
      ],
      now,
    );
    expect(summary.changePercent).toBeNull();
    expect(summary.series.reduce((a, b) => a + b, 0)).toBe(60000);
  });

  it('excludes and flags other currencies', () => {
    const summary = summarizeBookingValue([{ bookingDate: '2026-11-20', totalAmount: 500, currencyCode: 'USD' }], now);
    expect(summary.thisMonth).toBe(0);
    expect(summary.hasOtherCurrencies).toBe(true);
  });
});
