import { parseDateOnly } from '@/utils/format';

export type ValueRow = { bookingDate: string | null; totalAmount: number | null; currencyCode: string };

export type BookingValueSummary = {
  currencyCode: string;
  thisMonth: number;
  lastMonth: number;
  /** Oldest → newest, one value per month, ending with the current month. */
  series: number[];
  /** Percentage change vs last month; null when last month is zero (no honest baseline). */
  changePercent: number | null;
  /** True when some bookings use another currency and are left out of the totals. */
  hasOtherCurrencies: boolean;
};

export const VALUE_MONTHS = 6;

export function monthStart(now: Date, monthsBack: number): Date {
  return new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
}

/** Sums agreed booking value (confirmed + fulfilled) per calendar month of `booking_date`. */
export function summarizeBookingValue(rows: ValueRow[], now: Date, currencyCode = 'ETB'): BookingValueSummary {
  const series = new Array<number>(VALUE_MONTHS).fill(0);
  let hasOtherCurrencies = false;
  const first = monthStart(now, VALUE_MONTHS - 1);

  for (const row of rows) {
    if (row.totalAmount === null || !row.bookingDate) continue;
    if (row.currencyCode !== currencyCode) {
      hasOtherCurrencies = true;
      continue;
    }
    const date = parseDateOnly(row.bookingDate);
    if (!date || date < first) continue;
    const index = (date.getFullYear() - first.getFullYear()) * 12 + (date.getMonth() - first.getMonth());
    if (index >= 0 && index < VALUE_MONTHS) series[index] += row.totalAmount;
  }

  const thisMonth = series[VALUE_MONTHS - 1];
  const lastMonth = series[VALUE_MONTHS - 2];
  return {
    currencyCode,
    thisMonth,
    lastMonth,
    series,
    changePercent: lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null,
    hasOtherCurrencies,
  };
}
