import { describe, expect, it } from 'vitest';

import { parseEarningsSummary } from '@/features/earnings/utils/earningsSummary';

describe('parseEarningsSummary', () => {
  it('parses P6 booking-value fields and change percent', () => {
    const summary = parseEarningsSummary({
      currency_code: 'ETB',
      pipeline_value: 40000,
      confirmed_value: 55000,
      completed_value: 30000,
      agreed_deposits: 22000,
      pending_bookings: 1,
      confirmed_bookings: 1,
      fulfilled_bookings: 1,
      booking_value_this_month: 55000,
      booking_value_last_month: 50000,
      booking_value_series: [0, 0, 0, 0, 50000, 55000],
      has_other_currencies: false,
    });
    expect(summary).toMatchObject({
      pipelineValue: 40000,
      confirmedValue: 55000,
      completedValue: 30000,
      agreedDeposits: 22000,
      thisMonth: 55000,
      lastMonth: 50000,
      changePercent: 10,
      hasOtherCurrencies: false,
    });
    expect(summary?.series).toEqual([0, 0, 0, 0, 50000, 55000]);
  });

  it('returns null when the series is missing', () => {
    expect(parseEarningsSummary({ pipeline_value: 1 })).toBeNull();
  });
});
