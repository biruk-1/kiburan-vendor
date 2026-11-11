import {
  parseEarningsSummary,
  type EarningsSummary,
} from '@/features/earnings/utils/earningsSummary';
import { mapDataError, type ServiceResult } from '@/lib/query/queryError';
import { supabase } from '@/lib/supabase/client';

export type { EarningsSummary };

export async function getEarningsSummary(vendorId: string): Promise<ServiceResult<EarningsSummary>> {
  const { data, error } = await supabase.rpc('vendor_earnings_summary', { p_vendor_id: vendorId });
  if (error) return { ok: false, error: mapDataError(error) };
  const summary = parseEarningsSummary(data);
  if (!summary) {
    return { ok: false, error: { code: 'unknown', message: 'Earnings summary was incomplete. Please try again.' } };
  }
  return { ok: true, data: summary };
}
