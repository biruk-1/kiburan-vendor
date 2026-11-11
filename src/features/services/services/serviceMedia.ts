import { tryRemoveVendorPublicObject } from '@/features/business-profile/services/vendorStoragePaths';
import { mapDataError, type ServiceResult } from '@/lib/query/queryError';
import { supabase } from '@/lib/supabase/client';
import { isRemoteImage } from '@/utils/media';

export type ServicePhoto = {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
};

export async function listServicePhotos(
  vendorId: string,
  serviceId: string,
): Promise<ServiceResult<ServicePhoto[]>> {
  const { data, error } = await supabase
    .from('vendor_media')
    .select('id, storage_path, caption, sort_order')
    .eq('vendor_id', vendorId)
    .eq('service_id', serviceId)
    .eq('media_type', 'image')
    .order('sort_order', { ascending: true });
  if (error) return { ok: false, error: mapDataError(error) };

  return {
    ok: true,
    data: (data ?? [])
      .filter((row) => isRemoteImage(row.storage_path))
      .map((row) => ({
        id: row.id,
        url: row.storage_path,
        caption: row.caption,
        sortOrder: row.sort_order,
      })),
  };
}

export async function addServicePhoto(
  vendorId: string,
  serviceId: string,
  publicUrl: string,
): Promise<ServiceResult<ServicePhoto>> {
  const { data: existing, error: countError } = await supabase
    .from('vendor_media')
    .select('sort_order')
    .eq('vendor_id', vendorId)
    .eq('service_id', serviceId)
    .order('sort_order', { ascending: false })
    .limit(1);
  if (countError) return { ok: false, error: mapDataError(countError) };
  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('vendor_media')
    .insert({
      vendor_id: vendorId,
      service_id: serviceId,
      storage_path: publicUrl,
      media_type: 'image',
      sort_order: nextOrder,
    })
    .select('id, storage_path, caption, sort_order')
    .single();
  if (error) return { ok: false, error: mapDataError(error) };
  return {
    ok: true,
    data: {
      id: data.id,
      url: data.storage_path,
      caption: data.caption,
      sortOrder: data.sort_order,
    },
  };
}

export async function deleteServicePhoto(
  vendorId: string,
  mediaId: string,
  publicUrl: string,
): Promise<ServiceResult<null>> {
  const { error } = await supabase.from('vendor_media').delete().eq('vendor_id', vendorId).eq('id', mediaId);
  if (error) return { ok: false, error: mapDataError(error) };
  void tryRemoveVendorPublicObject(publicUrl);
  return { ok: true, data: null };
}
