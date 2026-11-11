import type { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query/queryKeys';

/**
 * Drops every cached query when the signed-in account changes (sign-out, or a different user
 * signing in), so no business data outlives the session that was allowed to read it.
 * Returns the new owner id. The first sign-in after a cold start keeps the (empty) cache.
 */
export function syncCacheOwner(
  queryClient: QueryClient,
  currentOwner: string | null,
  nextOwner: string | null,
): string | null {
  if (currentOwner === nextOwner) return currentOwner;
  if (currentOwner !== null) {
    void queryClient.cancelQueries();
    queryClient.clear();
  }
  return nextOwner;
}

/** Drops one business's cached data, e.g. after switching to another business. */
export function dropVendorCache(queryClient: QueryClient, vendorId: string): void {
  const queryKey = queryKeys.vendorScope(vendorId);
  void queryClient.cancelQueries({ queryKey });
  queryClient.removeQueries({ queryKey });
}
