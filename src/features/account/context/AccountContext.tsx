import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, use, useCallback, useMemo, type ReactNode } from 'react';

import { useAuth } from '@/features/auth/context/AuthContext';
import { listMyVendors } from '@/features/account/services/accountService';
import { vendorPreferenceKey } from '@/features/account/services/vendorPreference';
import type { AccountState } from '@/features/account/types';
import { resolveAccountState } from '@/features/account/utils/accountState';
import { dropVendorCache } from '@/lib/query/cacheOwner';
import { errorMessage, unwrap } from '@/lib/query/queryError';
import { queryKeys, staleTimes } from '@/lib/query/queryKeys';

type AccountContextValue = {
  state: AccountState;
  /** Persists the choice and drops the previous business's cached data. */
  selectVendor: (vendorId: string) => Promise<void>;
  /** Forgets the stored choice so the business picker shows again. */
  clearSelection: () => Promise<void>;
  reload: () => Promise<void>;
};

const AccountContext = createContext<AccountContextValue | null>(null);

function preferenceQueryKey(userId: string) {
  return ['user', userId, 'active-vendor-preference'] as const;
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const { user, isRestoring } = useAuth();
  const userId = user?.id ?? null;
  const queryClient = useQueryClient();

  const vendorsQuery = useQuery({
    queryKey: queryKeys.myVendors(userId ?? 'anonymous'),
    queryFn: async () => unwrap(await listMyVendors(userId!)),
    enabled: Boolean(userId),
    staleTime: staleTimes.profile,
  });

  const preferenceQuery = useQuery({
    queryKey: preferenceQueryKey(userId ?? 'anonymous'),
    queryFn: async () => AsyncStorage.getItem(vendorPreferenceKey(userId!)),
    enabled: Boolean(userId),
    staleTime: Infinity,
  });

  const state = useMemo(
    () =>
      resolveAccountState({
        isRestoring,
        hasSession: Boolean(userId),
        vendors:
          vendorsQuery.status === 'success'
            ? { status: 'success', data: vendorsQuery.data }
            : vendorsQuery.status === 'error'
              ? { status: 'error', message: errorMessage(vendorsQuery.error) }
              : { status: 'pending' },
        preferredVendorId: preferenceQuery.status === 'success' ? preferenceQuery.data : undefined,
      }),
    [isRestoring, userId, vendorsQuery.status, vendorsQuery.data, vendorsQuery.error, preferenceQuery.status, preferenceQuery.data],
  );

  const activeVendorId = state.kind === 'workspace' ? state.vendor.vendorId : null;

  const writePreference = useCallback(
    async (vendorId: string | null) => {
      if (!userId) return;
      const key = vendorPreferenceKey(userId);
      if (vendorId) await AsyncStorage.setItem(key, vendorId);
      else await AsyncStorage.removeItem(key);
      if (activeVendorId && activeVendorId !== vendorId) dropVendorCache(queryClient, activeVendorId);
      queryClient.setQueryData(preferenceQueryKey(userId), vendorId);
    },
    [userId, activeVendorId, queryClient],
  );

  const value = useMemo<AccountContextValue>(
    () => ({
      state,
      selectVendor: (vendorId) => writePreference(vendorId),
      clearSelection: () => writePreference(null),
      reload: async () => {
        await vendorsQuery.refetch();
      },
    }),
    [state, writePreference, vendorsQuery],
  );

  return <AccountContext value={value}>{children}</AccountContext>;
}

export function useAccount(): AccountContextValue {
  const value = use(AccountContext);
  if (!value) throw new Error('useAccount must be used inside <AccountProvider>');
  return value;
}

/** For screens inside the (vendor) group, where a workspace is guaranteed by the route guard. */
export function useActiveVendor() {
  const { state } = useAccount();
  if (state.kind !== 'workspace') {
    throw new Error('useActiveVendor called outside an active vendor workspace');
  }
  return state;
}
