import { useQuery } from '@tanstack/react-query';

import { getReviewSummary } from '@/features/reviews/services/reviewService';
import { unwrap } from '@/lib/query/queryError';
import { queryKeys, staleTimes } from '@/lib/query/queryKeys';

export function useReviewSummary(vendorId: string) {
  return useQuery({
    queryKey: queryKeys.reviewSummary(vendorId),
    queryFn: async () => unwrap(await getReviewSummary(vendorId)),
    staleTime: staleTimes.profile,
  });
}
