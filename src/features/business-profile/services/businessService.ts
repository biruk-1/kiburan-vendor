import {
  normalizeOptionalUrl,
  type BusinessProfileValues,
} from '@/features/business-profile/validation/businessProfileSchema';
import { tryRemoveVendorPublicObject } from '@/features/business-profile/services/vendorStoragePaths';
import { one } from '@/lib/supabase/embed';
import { mapDataError, type ServiceResult } from '@/lib/query/queryError';
import { supabase } from '@/lib/supabase/client';
import { isRemoteImage } from '@/utils/media';

export type VendorDetails = {
  id: string;
  businessName: string;
  description: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  listingStatus: string;
  verificationStatus: string;
  createdAt: string;
  categories: string[];
  categoryIds: string[];
};

export type PortfolioItem = {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
};

export async function getVendorDetails(vendorId: string): Promise<ServiceResult<VendorDetails>> {
  const { data, error } = await supabase
    .from('vendors')
    .select(
      'id, business_name, description, city, phone, email, address, website_url, instagram_url, logo_url, cover_url, listing_status, verification_status, created_at, memberships:vendor_category_memberships ( category_id, category:vendor_categories ( name_en ) )',
    )
    .eq('id', vendorId)
    .single();
  if (error) return { ok: false, error: mapDataError(error) };
  return {
    ok: true,
    data: {
      id: data.id,
      businessName: data.business_name,
      description: data.description,
      city: data.city,
      phone: data.phone,
      email: data.email,
      address: data.address,
      websiteUrl: data.website_url,
      instagramUrl: data.instagram_url,
      logoUrl: data.logo_url,
      coverUrl: data.cover_url,
      listingStatus: data.listing_status,
      verificationStatus: data.verification_status,
      createdAt: data.created_at,
      categories: (data.memberships ?? [])
        .map((membership) => one(membership.category)?.name_en)
        .filter((name): name is string => Boolean(name)),
      categoryIds: (data.memberships ?? []).map((membership) => membership.category_id).filter(Boolean),
    },
  };
}

export async function updateVendorProfile(
  vendorId: string,
  values: BusinessProfileValues,
): Promise<ServiceResult<VendorDetails>> {
  const { error: updateError } = await supabase
    .from('vendors')
    .update({
      business_name: values.businessName,
      city: values.city,
      description: values.description,
      phone: values.phone || null,
      email: values.email || null,
      address: values.address || null,
      website_url: normalizeOptionalUrl(values.websiteUrl),
      instagram_url: normalizeOptionalUrl(values.instagramUrl),
      updated_at: new Date().toISOString(),
    })
    .eq('id', vendorId);
  if (updateError) return { ok: false, error: mapDataError(updateError) };

  const { data: existing, error: existingError } = await supabase
    .from('vendor_category_memberships')
    .select('category_id')
    .eq('vendor_id', vendorId);
  if (existingError) return { ok: false, error: mapDataError(existingError) };

  const current = new Set((existing ?? []).map((row) => row.category_id));
  const next = new Set(values.categoryIds);
  const toRemove = [...current].filter((id) => !next.has(id));
  const toAdd = [...next].filter((id) => !current.has(id));

  if (toRemove.length) {
    const { error } = await supabase
      .from('vendor_category_memberships')
      .delete()
      .eq('vendor_id', vendorId)
      .in('category_id', toRemove);
    if (error) return { ok: false, error: mapDataError(error) };
  }
  if (toAdd.length) {
    const { error } = await supabase.from('vendor_category_memberships').insert(
      toAdd.map((categoryId) => ({ vendor_id: vendorId, category_id: categoryId })),
    );
    if (error) return { ok: false, error: mapDataError(error) };
  }

  return getVendorDetails(vendorId);
}

export async function setVendorListingStatus(
  vendorId: string,
  listingStatus: 'draft' | 'published',
): Promise<ServiceResult<{ listingStatus: string }>> {
  const { data, error } = await supabase
    .from('vendors')
    .update({ listing_status: listingStatus, updated_at: new Date().toISOString() })
    .eq('id', vendorId)
    .select('listing_status')
    .single();
  if (error) return { ok: false, error: mapListingError(error) };
  return { ok: true, data: { listingStatus: data.listing_status } };
}

export async function setVendorLogoUrl(
  vendorId: string,
  publicUrl: string,
  previousUrl: string | null,
): Promise<ServiceResult<{ logoUrl: string }>> {
  const { error } = await supabase
    .from('vendors')
    .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', vendorId);
  if (error) return { ok: false, error: mapDataError(error) };
  void tryRemoveVendorPublicObject(previousUrl);
  return { ok: true, data: { logoUrl: publicUrl } };
}

export async function setVendorCoverUrl(
  vendorId: string,
  publicUrl: string,
  previousUrl: string | null,
): Promise<ServiceResult<{ coverUrl: string }>> {
  const { error } = await supabase
    .from('vendors')
    .update({ cover_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', vendorId);
  if (error) return { ok: false, error: mapDataError(error) };
  void tryRemoveVendorPublicObject(previousUrl);
  return { ok: true, data: { coverUrl: publicUrl } };
}

export type VendorImages = {
  /** First image per service, in `sort_order`. */
  byService: Record<string, string>;
  /** First portfolio image of the business. */
  first: string | null;
};

export async function getVendorImages(vendorId: string): Promise<ServiceResult<VendorImages>> {
  const { data, error } = await supabase
    .from('vendor_media')
    .select('service_id, storage_path')
    .eq('vendor_id', vendorId)
    .eq('media_type', 'image')
    .order('sort_order', { ascending: true });
  if (error) return { ok: false, error: mapDataError(error) };

  const byService: Record<string, string> = {};
  let first: string | null = null;
  for (const row of data ?? []) {
    if (!isRemoteImage(row.storage_path)) continue;
    first ??= row.storage_path;
    if (row.service_id && !byService[row.service_id]) byService[row.service_id] = row.storage_path;
  }
  return { ok: true, data: { byService, first } };
}

export async function listPortfolioMedia(vendorId: string): Promise<ServiceResult<PortfolioItem[]>> {
  const { data, error } = await supabase
    .from('vendor_media')
    .select('id, storage_path, caption, sort_order')
    .eq('vendor_id', vendorId)
    .eq('media_type', 'image')
    .is('service_id', null)
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

export async function addPortfolioImage(
  vendorId: string,
  publicUrl: string,
): Promise<ServiceResult<PortfolioItem>> {
  const { data: existing, error: countError } = await supabase
    .from('vendor_media')
    .select('sort_order')
    .eq('vendor_id', vendorId)
    .is('service_id', null)
    .order('sort_order', { ascending: false })
    .limit(1);
  if (countError) return { ok: false, error: mapDataError(countError) };
  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('vendor_media')
    .insert({
      vendor_id: vendorId,
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

export async function deletePortfolioImage(
  vendorId: string,
  mediaId: string,
  publicUrl: string,
): Promise<ServiceResult<null>> {
  const { error } = await supabase.from('vendor_media').delete().eq('vendor_id', vendorId).eq('id', mediaId);
  if (error) return { ok: false, error: mapDataError(error) };
  void tryRemoveVendorPublicObject(publicUrl);
  return { ok: true, data: null };
}

export async function getMyDisplayName(userId: string): Promise<ServiceResult<string | null>> {
  const { data, error } = await supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle();
  if (error) return { ok: false, error: mapDataError(error) };
  return { ok: true, data: data?.display_name?.trim() || null };
}

function mapListingError(error: { message?: string; code?: string; name?: string } | Error | null) {
  const message = (('message' in (error ?? {}) ? (error as { message?: string }).message : '') ?? '').toLowerCase();
  if (message.includes('suspended')) {
    return { code: 'forbidden', message: 'Suspended listings cannot be changed from the app.' };
  }
  if (message.includes('verification_status')) {
    return { code: 'forbidden', message: 'Verification can only be changed by Kiburan staff.' };
  }
  return mapDataError(error);
}
