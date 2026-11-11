export type EarningsSummary = {
  currencyCode: string;
  pipelineValue: number;
  confirmedValue: number;
  completedValue: number;
  agreedDeposits: number;
  pendingBookings: number;
  confirmedBookings: number;
  fulfilledBookings: number;
  thisMonth: number;
  lastMonth: number;
  series: number[];
  changePercent: number | null;
  hasOtherCurrencies: boolean;
};

function num(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function parseEarningsSummary(raw: unknown): EarningsSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const seriesRaw = Array.isArray(row.booking_value_series) ? row.booking_value_series : null;
  if (!seriesRaw || seriesRaw.length !== 6) return null;
  const series = seriesRaw.map((value) => num(value));
  const thisMonth = num(row.booking_value_this_month);
  const lastMonth = num(row.booking_value_last_month);
  return {
    currencyCode: typeof row.currency_code === 'string' ? row.currency_code : 'ETB',
    pipelineValue: num(row.pipeline_value),
    confirmedValue: num(row.confirmed_value),
    completedValue: num(row.completed_value),
    agreedDeposits: num(row.agreed_deposits),
    pendingBookings: num(row.pending_bookings),
    confirmedBookings: num(row.confirmed_bookings),
    fulfilledBookings: num(row.fulfilled_bookings),
    thisMonth,
    lastMonth,
    series,
    changePercent: lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null,
    hasOtherCurrencies: Boolean(row.has_other_currencies),
  };
}
