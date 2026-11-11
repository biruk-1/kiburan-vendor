import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/context/AuthContext';
import {
  addPortfolioImage,
  deletePortfolioImage,
  getMyDisplayName,
  getVendorDetails,
  getVendorImages,
  listPortfolioMedia,
  setVendorCoverUrl,
  setVendorListingStatus,
  setVendorLogoUrl,
  updateVendorProfile,
} from '@/features/business-profile/services/businessService';
import type { BusinessProfileValues } from '@/features/business-profile/validation/businessProfileSchema';
import { unwrap } from '@/lib/query/queryError';
import { queryKeys, staleTimes } from '@/lib/query/queryKeys';

export function useVendorDetails(vendorId: string) {
  return useQuery({
    queryKey: queryKeys.vendorDetails(vendorId),
    queryFn: async () => unwrap(await getVendorDetails(vendorId)),
    staleTime: staleTimes.profile,
  });
}

export function useVendorImages(vendorId: string) {
  return useQuery({
    queryKey: queryKeys.vendorImages(vendorId),
    queryFn: async () => unwrap(await getVendorImages(vendorId)),
    staleTime: staleTimes.profile,
  });
}

export function usePortfolioMedia(vendorId: string) {
  return useQuery({
    queryKey: queryKeys.vendorPortfolio(vendorId),
    queryFn: async () => unwrap(await listPortfolioMedia(vendorId)),
    staleTime: staleTimes.profile,
  });
}

export function useMyDisplayName() {
  const { user } = useAuth();
  const userId = user?.id ?? 'anonymous';
  return useQuery({
    queryKey: queryKeys.myProfile(userId),
    queryFn: async () => unwrap(await getMyDisplayName(userId)),
    enabled: Boolean(user),
    staleTime: staleTimes.profile,
  });
}

function useInvalidateBusiness(vendorId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorDetails(vendorId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorImages(vendorId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorPortfolio(vendorId) }),
      user ? queryClient.invalidateQueries({ queryKey: queryKeys.myVendors(user.id) }) : Promise.resolve(),
    ]);
  };
}

export function useUpdateVendorProfile(vendorId: string) {
  const invalidate = useInvalidateBusiness(vendorId);
  return useMutation({
    mutationFn: async (values: BusinessProfileValues) => unwrap(await updateVendorProfile(vendorId, values)),
    onSuccess: invalidate,
  });
}

export function useSetListingStatus(vendorId: string) {
  const invalidate = useInvalidateBusiness(vendorId);
  return useMutation({
    mutationFn: async (listingStatus: 'draft' | 'published') =>
      unwrap(await setVendorListingStatus(vendorId, listingStatus)),
    onSuccess: invalidate,
  });
}

export function useSetVendorLogo(vendorId: string) {
  const invalidate = useInvalidateBusiness(vendorId);
  return useMutation({
    mutationFn: async (input: { publicUrl: string; previousUrl: string | null }) =>
      unwrap(await setVendorLogoUrl(vendorId, input.publicUrl, input.previousUrl)),
    onSuccess: invalidate,
  });
}

export function useSetVendorCover(vendorId: string) {
  const invalidate = useInvalidateBusiness(vendorId);
  return useMutation({
    mutationFn: async (input: { publicUrl: string; previousUrl: string | null }) =>
      unwrap(await setVendorCoverUrl(vendorId, input.publicUrl, input.previousUrl)),
    onSuccess: invalidate,
  });
}

export function useAddPortfolioImage(vendorId: string) {
  const invalidate = useInvalidateBusiness(vendorId);
  return useMutation({
    mutationFn: async (publicUrl: string) => unwrap(await addPortfolioImage(vendorId, publicUrl)),
    onSuccess: invalidate,
  });
}

export function useDeletePortfolioImage(vendorId: string) {
  const invalidate = useInvalidateBusiness(vendorId);
  return useMutation({
    mutationFn: async (input: { mediaId: string; publicUrl: string }) =>
      unwrap(await deletePortfolioImage(vendorId, input.mediaId, input.publicUrl)),
    onSuccess: invalidate,
  });
}
