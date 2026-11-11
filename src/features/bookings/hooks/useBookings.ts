import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  countClients,
  getBooking,
  getBookingStatuses,
  listBookings,
  respondToBooking,
  type BookingCursor,
} from '@/features/bookings/services/bookingService';
import { countByFilter, type BookingFilter } from '@/features/bookings/utils/bookingStatus';
import { unwrap } from '@/lib/query/queryError';
import { queryKeys, staleTimes } from '@/lib/query/queryKeys';

export function useBookingList(vendorId: string, filter: BookingFilter) {
  return useInfiniteQuery({
    queryKey: queryKeys.bookingList(vendorId, filter),
    queryFn: async ({ pageParam }) => unwrap(await listBookings(vendorId, filter, pageParam)),
    initialPageParam: null as BookingCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: staleTimes.operational,
  });
}

export function useBookingCounts(vendorId: string) {
  return useQuery({
    queryKey: queryKeys.bookingCounts(vendorId),
    queryFn: async () => unwrap(await getBookingStatuses(vendorId)),
    select: countByFilter,
    staleTime: staleTimes.operational,
  });
}

export function useBooking(vendorId: string, bookingId: string) {
  return useQuery({
    queryKey: queryKeys.booking(vendorId, bookingId),
    queryFn: async () => unwrap(await getBooking(vendorId, bookingId)),
    staleTime: staleTimes.operational,
  });
}

export function useRespondToBooking(vendorId: string, bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { action: 'confirm' | 'decline' | 'fulfil'; note?: string | null }) =>
      unwrap(await respondToBooking(bookingId, input.action, input.note)),
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.booking(vendorId, bookingId), data);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings(vendorId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(vendorId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.availability(vendorId) }),
      ]);
    },
  });
}

export function useClientCount(vendorId: string) {
  return useQuery({
    queryKey: queryKeys.clientCount(vendorId),
    queryFn: async () => unwrap(await countClients(vendorId)),
    staleTime: staleTimes.profile,
  });
}
