import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getInquiry,
  listInquiries,
  sendQuote,
  updateInquiryStatus,
  type InquiryCursor,
  type InquiryStatus,
} from '@/features/inquiries/services/inquiryService';
import type { InquiryFilter } from '@/features/inquiries/utils/inquiryStatus';
import { unwrap } from '@/lib/query/queryError';
import { queryKeys, staleTimes } from '@/lib/query/queryKeys';

export function useInquiryList(vendorId: string, filter: InquiryFilter) {
  return useInfiniteQuery({
    queryKey: queryKeys.inquiryList(vendorId, filter),
    queryFn: async ({ pageParam }) =>
      unwrap(await listInquiries(vendorId, filter === 'all' ? 'all' : filter, pageParam)),
    initialPageParam: null as InquiryCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: staleTimes.operational,
  });
}

export function useInquiry(vendorId: string, inquiryId: string) {
  return useQuery({
    queryKey: queryKeys.inquiry(vendorId, inquiryId),
    queryFn: async () => unwrap(await getInquiry(inquiryId)),
    staleTime: staleTimes.operational,
  });
}

function useInvalidateInquiries(vendorId: string) {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.inquiries(vendorId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(vendorId) }),
    ]);
  };
}

export function useUpdateInquiryStatus(vendorId: string, inquiryId: string) {
  const invalidate = useInvalidateInquiries(vendorId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: 'replied' | 'declined' | 'closed') =>
      unwrap(await updateInquiryStatus(inquiryId, status)),
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.inquiry(vendorId, inquiryId), data);
      await invalidate();
    },
  });
}

export function useSendQuote(vendorId: string, inquiryId: string) {
  const invalidate = useInvalidateInquiries(vendorId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      amount: number;
      packageId: string | null;
      description: string | null;
      validUntil: string | null;
    }) => unwrap(await sendQuote({ inquiryId, ...input })),
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.inquiry(vendorId, inquiryId), data);
      await invalidate();
    },
  });
}

export type { InquiryStatus };
