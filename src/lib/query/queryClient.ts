import { QueryClient } from '@tanstack/react-query';

import { retryDelay, shouldRetryQuery } from '@/lib/query/queryError';
import { staleTimes } from '@/lib/query/queryKeys';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: staleTimes.operational,
        gcTime: 30 * 60_000,
        retry: shouldRetryQuery,
        retryDelay,
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export const queryClient = createQueryClient();
