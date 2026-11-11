import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAvailability,
  deleteAvailability,
  listAvailability,
  updateAvailability,
  type AvailabilityInput,
} from '@/features/availability/services/availabilityService';
import { unwrap } from '@/lib/query/queryError';
import { queryKeys, staleTimes } from '@/lib/query/queryKeys';

function rangeStartIso() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

export function useAvailability(vendorId: string) {
  return useQuery({
    queryKey: queryKeys.availability(vendorId),
    queryFn: async () => unwrap(await listAvailability(vendorId, rangeStartIso())),
    staleTime: staleTimes.profile,
  });
}

function useInvalidateAvailability(vendorId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.availability(vendorId) });
}

export function useCreateAvailability(vendorId: string) {
  const invalidate = useInvalidateAvailability(vendorId);
  return useMutation({
    mutationFn: async (input: AvailabilityInput) => unwrap(await createAvailability(vendorId, input)),
    onSuccess: invalidate,
  });
}

export function useUpdateAvailability(vendorId: string) {
  const invalidate = useInvalidateAvailability(vendorId);
  return useMutation({
    mutationFn: async ({ windowId, input }: { windowId: string; input: AvailabilityInput }) =>
      unwrap(await updateAvailability(vendorId, windowId, input)),
    onSuccess: invalidate,
  });
}

export function useDeleteAvailability(vendorId: string) {
  const invalidate = useInvalidateAvailability(vendorId);
  return useMutation({
    mutationFn: async (windowId: string) => unwrap(await deleteAvailability(vendorId, windowId)),
    onSuccess: invalidate,
  });
}
