import { useQuery } from '@tanstack/react-query';

import { getEarningsSummary } from '@/features/earnings/services/earningsService';
import { unwrap } from '@/lib/query/queryError';
import { queryKeys, staleTimes } from '@/lib/query/queryKeys';

export function useEarnings(vendorId: string) {
  return useQuery({
    queryKey: queryKeys.earnings(vendorId),
    queryFn: async () => unwrap(await getEarningsSummary(vendorId)),
    staleTime: staleTimes.operational,
  });
}
