import { useQuery } from '@tanstack/react-query';

import { getDashboard } from '@/features/dashboard/services/dashboardService';
import { unwrap } from '@/lib/query/queryError';
import { queryKeys, staleTimes } from '@/lib/query/queryKeys';

export function useDashboard(vendorId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.dashboard(vendorId),
    queryFn: async () => unwrap(await getDashboard(vendorId)),
    staleTime: staleTimes.operational,
    enabled: Boolean(vendorId) && (options?.enabled ?? true),
  });
}
