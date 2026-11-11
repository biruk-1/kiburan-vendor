import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createPackage,
  deletePackage,
  getPackage,
  listPackages,
  updatePackage,
  type PackageInput,
} from '@/features/services/services/packageCatalog';
import {
  addServicePhoto,
  deleteServicePhoto,
  listServicePhotos,
} from '@/features/services/services/serviceMedia';
import {
  createService,
  deleteService,
  getService,
  listCategories,
  listServices,
  setServiceActive,
  updateService,
  type ServiceInput,
} from '@/features/services/services/serviceCatalog';
import { unwrap } from '@/lib/query/queryError';
import { queryKeys, staleTimes } from '@/lib/query/queryKeys';

export function useServices(vendorId: string) {
  return useQuery({
    queryKey: queryKeys.services(vendorId),
    queryFn: async () => unwrap(await listServices(vendorId)),
    staleTime: staleTimes.profile,
  });
}

export function useService(vendorId: string, serviceId: string) {
  return useQuery({
    queryKey: queryKeys.service(vendorId, serviceId),
    queryFn: async () => unwrap(await getService(vendorId, serviceId)),
    staleTime: staleTimes.profile,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.vendorCategories(),
    queryFn: async () => unwrap(await listCategories()),
    staleTime: staleTimes.reference,
  });
}

export function useServicePhotos(vendorId: string, serviceId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.servicePhotos(vendorId, serviceId),
    queryFn: async () => unwrap(await listServicePhotos(vendorId, serviceId)),
    enabled: Boolean(serviceId) && enabled,
    staleTime: staleTimes.profile,
  });
}

function useInvalidateServices(vendorId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.services(vendorId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorImages(vendorId) }),
    ]);
}

export function useCreateService(vendorId: string) {
  const invalidate = useInvalidateServices(vendorId);
  return useMutation({
    mutationFn: async (input: ServiceInput) => unwrap(await createService(vendorId, input)),
    onSuccess: invalidate,
  });
}

export function useUpdateService(vendorId: string, serviceId: string) {
  const invalidate = useInvalidateServices(vendorId);
  return useMutation({
    mutationFn: async (input: ServiceInput) => unwrap(await updateService(vendorId, serviceId, input)),
    onSuccess: invalidate,
  });
}

export function useSetServiceActive(vendorId: string) {
  const invalidate = useInvalidateServices(vendorId);
  return useMutation({
    mutationFn: async ({ serviceId, isActive }: { serviceId: string; isActive: boolean }) =>
      unwrap(await setServiceActive(vendorId, serviceId, isActive)),
    onSuccess: invalidate,
  });
}

export function useDeleteService(vendorId: string) {
  const invalidate = useInvalidateServices(vendorId);
  return useMutation({
    mutationFn: async (serviceId: string) => unwrap(await deleteService(vendorId, serviceId)),
    onSuccess: invalidate,
  });
}

export function useAddServicePhoto(vendorId: string, serviceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicUrl: string) => unwrap(await addServicePhoto(vendorId, serviceId, publicUrl)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.servicePhotos(vendorId, serviceId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.vendorImages(vendorId) }),
      ]);
    },
  });
}

export function useDeleteServicePhoto(vendorId: string, serviceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { mediaId: string; publicUrl: string }) =>
      unwrap(await deleteServicePhoto(vendorId, input.mediaId, input.publicUrl)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.servicePhotos(vendorId, serviceId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.vendorImages(vendorId) }),
      ]);
    },
  });
}

export function usePackages(vendorId: string, serviceId: string) {
  return useQuery({
    queryKey: queryKeys.servicePackages(vendorId, serviceId),
    queryFn: async () => unwrap(await listPackages(serviceId)),
    staleTime: staleTimes.profile,
  });
}

export function usePackage(vendorId: string, serviceId: string, packageId: string) {
  return useQuery({
    queryKey: queryKeys.servicePackage(vendorId, serviceId, packageId),
    queryFn: async () => unwrap(await getPackage(serviceId, packageId)),
    staleTime: staleTimes.profile,
  });
}

function useInvalidatePackages(vendorId: string, serviceId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.servicePackages(vendorId, serviceId) });
}

export function useCreatePackage(vendorId: string, serviceId: string) {
  const invalidate = useInvalidatePackages(vendorId, serviceId);
  return useMutation({
    mutationFn: async (input: PackageInput) => unwrap(await createPackage(serviceId, input)),
    onSuccess: invalidate,
  });
}

export function useUpdatePackage(vendorId: string, serviceId: string, packageId: string) {
  const invalidate = useInvalidatePackages(vendorId, serviceId);
  return useMutation({
    mutationFn: async (input: PackageInput) => unwrap(await updatePackage(serviceId, packageId, input)),
    onSuccess: invalidate,
  });
}

export function useDeletePackage(vendorId: string, serviceId: string) {
  const invalidate = useInvalidatePackages(vendorId, serviceId);
  return useMutation({
    mutationFn: async (packageId: string) => unwrap(await deletePackage(serviceId, packageId)),
    onSuccess: invalidate,
  });
}
