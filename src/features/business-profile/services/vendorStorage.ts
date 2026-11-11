import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { mapStorageError } from '@/features/business-profile/services/vendorStoragePaths';
import { type ServiceResult } from '@/lib/query/queryError';
import { supabase } from '@/lib/supabase/client';
import {
  contentTypeForExt,
  mimeToImageExt,
  VENDOR_IMAGE_MAX_EDGE,
  VENDOR_PUBLIC_BUCKET,
  VENDOR_PUBLIC_MAX_BYTES,
  vendorPublicObjectPath,
} from '@/utils/media';

export type PickedImage = {
  uri: string;
  mimeType: string | null;
  width: number;
  height: number;
};

export type UploadedPublicImage = {
  /** Absolute https URL for `vendors.logo_url` / `cover_url` / `vendor_media.storage_path`. */
  publicUrl: string;
  storagePath: string;
};

/** Opens the library; returns null when the user cancels. */
export async function pickVendorImage(): Promise<ServiceResult<PickedImage | null>> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      ok: false,
      error: {
        code: 'permission',
        message: 'Allow photo access to upload images for your business profile.',
      },
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) return { ok: true, data: null };

  const asset = result.assets[0];
  return {
    ok: true,
    data: {
      uri: asset.uri,
      mimeType: asset.mimeType ?? null,
      width: asset.width,
      height: asset.height,
    },
  };
}

async function resizeForUpload(picked: PickedImage): Promise<{ uri: string; mimeType: string }> {
  const longest = Math.max(picked.width || 0, picked.height || 0);
  const needsResize = longest > VENDOR_IMAGE_MAX_EDGE;
  const manipulated = await ImageManipulator.manipulateAsync(
    picked.uri,
    needsResize ? [{ resize: { width: VENDOR_IMAGE_MAX_EDGE } }] : [],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
  );
  return { uri: manipulated.uri, mimeType: 'image/jpeg' };
}

export async function uploadVendorPublicImage(input: {
  vendorId: string;
  kind: 'logo' | 'cover' | 'portfolio' | 'service';
  picked: PickedImage;
  serviceId?: string;
}): Promise<ServiceResult<UploadedPublicImage>> {
  const prepared = await resizeForUpload(input.picked);
  const ext = mimeToImageExt(prepared.mimeType);
  const contentType = contentTypeForExt(ext);
  const storagePath = vendorPublicObjectPath(input.vendorId, input.kind, ext, input.serviceId);

  const response = await fetch(prepared.uri);
  if (!response.ok) {
    return { ok: false, error: { code: 'read_failed', message: 'Could not read the selected photo.' } };
  }
  const blob = await response.blob();
  if (blob.size > VENDOR_PUBLIC_MAX_BYTES) {
    return { ok: false, error: { code: 'too_large', message: 'Choose a photo under 5 MB.' } };
  }

  const { error: uploadError } = await supabase.storage.from(VENDOR_PUBLIC_BUCKET).upload(storagePath, blob, {
    contentType,
    upsert: false,
  });
  if (uploadError) return { ok: false, error: mapStorageError(uploadError) };

  const { data } = supabase.storage.from(VENDOR_PUBLIC_BUCKET).getPublicUrl(storagePath);
  // Cache-bust so expo-image refreshes immediately after replace.
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
  return { ok: true, data: { publicUrl, storagePath } };
}

export { tryRemoveVendorPublicObject, storagePathFromPublicUrl } from '@/features/business-profile/services/vendorStoragePaths';
