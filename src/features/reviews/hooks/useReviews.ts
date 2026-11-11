import { useInfiniteQuery } from '@tanstack/react-query';

import { listReviews, type ReviewCursor } from '@/features/reviews/services/reviewService';
import type { ReviewFilter } from '@/features/reviews/utils/reviewStatus';
import { unwrap } from '@/lib/query/queryError';
import { queryKeys, staleTimes } from '@/lib/query/queryKeys';

export function useReviewList(vendorId: string, filter: ReviewFilter) {
  return useInfiniteQuery({
    queryKey: queryKeys.reviewList(vendorId, filter),
    queryFn: async ({ pageParam }) => unwrap(await listReviews(vendorId, filter, pageParam)),
    initialPageParam: null as ReviewCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: staleTimes.operational,
  });
}
