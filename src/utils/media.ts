/**
 * Marketplace media rules (shared with the client):
 * - Only absolute `https://` URLs render.
 * - Vendor uploads store the public object URL from `vendor-public`, not a bare storage path,
 *   so the client `resolveMediaUrl` keeps working without a coordinated client change.
 */
export function isRemoteImage(uri: string | null | undefined): uri is string {
  return typeof uri === 'string' && uri.startsWith('https://');
}

export const VENDOR_PUBLIC_BUCKET = 'vendor-public';
export const VENDOR_PRIVATE_BUCKET = 'vendor-private';

/** Max edge length before upload (performance rule). */
export const VENDOR_IMAGE_MAX_EDGE = 1600;

/** Matches the `vendor-public` bucket file_size_limit. */
export const VENDOR_PUBLIC_MAX_BYTES = 5 * 1024 * 1024;

export function mimeToImageExt(mime: string | null | undefined): 'jpg' | 'png' | 'webp' {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

export function contentTypeForExt(ext: 'jpg' | 'png' | 'webp'): string {
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

export type VendorPublicImageKind = 'logo' | 'cover' | 'portfolio' | 'service';

/**
 * Builds a storage object key. First path segment must be the vendor id
 * (RLS uses `storage.foldername(name)[1]`).
 */
export function vendorPublicObjectPath(
  vendorId: string,
  kind: VendorPublicImageKind,
  ext: 'jpg' | 'png' | 'webp',
  serviceId?: string,
): string {
  if (kind === 'service') {
    if (!serviceId) throw new Error('serviceId is required for service photo uploads.');
    return `${vendorId}/service/${serviceId}/${Date.now()}.${ext}`;
  }
  return `${vendorId}/${kind}/${Date.now()}.${ext}`;
}
