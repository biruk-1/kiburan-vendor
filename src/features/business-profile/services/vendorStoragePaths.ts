import { mapDataError } from '@/lib/query/queryError';
import { supabase } from '@/lib/supabase/client';
import { VENDOR_PUBLIC_BUCKET } from '@/utils/media';

/** Best-effort cleanup when replacing a previous upload in our bucket. */
export async function tryRemoveVendorPublicObject(publicUrl: string | null | undefined): Promise<void> {
  if (!publicUrl) return;
  const path = storagePathFromPublicUrl(publicUrl);
  if (!path) return;
  await supabase.storage.from(VENDOR_PUBLIC_BUCKET).remove([path]);
}

export function storagePathFromPublicUrl(publicUrl: string): string | null {
  const marker = `/object/public/${VENDOR_PUBLIC_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index < 0) return null;
  const raw = publicUrl.slice(index + marker.length).split('?')[0];
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function mapStorageError(error: { message?: string; statusCode?: string } | Error | null) {
  const message = (('message' in (error ?? {}) ? (error as { message?: string }).message : '') ?? '').toLowerCase();
  if (message.includes('payload') || message.includes('too large') || message.includes('size')) {
    return { code: 'too_large', message: 'Choose a photo under 5 MB.' };
  }
  if (message.includes('mime') || message.includes('type')) {
    return { code: 'invalid_type', message: 'Use a JPEG, PNG, or WebP image.' };
  }
  return mapDataError(error);
}
