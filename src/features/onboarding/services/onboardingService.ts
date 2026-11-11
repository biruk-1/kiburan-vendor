import { mapDataError, type ServiceResult } from '@/lib/query/queryError';
import { supabase } from '@/lib/supabase/client';

export type CreatedVendor = {
  id: string;
  businessName: string;
  slug: string;
  verificationStatus: string;
  listingStatus: string;
};

export async function createVendor(input: {
  businessName: string;
  categoryIds: string[];
  city: string;
  description: string;
  phone: string | null;
  email: string | null;
}): Promise<ServiceResult<CreatedVendor>> {
  const { data, error } = await supabase.rpc('create_vendor', {
    p_business_name: input.businessName,
    p_category_ids: input.categoryIds,
    p_city: input.city,
    p_description: input.description,
    p_phone: input.phone ?? undefined,
    p_email: input.email ?? undefined,
  });
  if (error) return { ok: false, error: mapOnboardingError(error) };
  return {
    ok: true,
    data: {
      id: data.id,
      businessName: data.business_name,
      slug: data.slug,
      verificationStatus: data.verification_status,
      listingStatus: data.listing_status,
    },
  };
}

export async function submitVendorForVerification(vendorId: string): Promise<ServiceResult<CreatedVendor>> {
  const { data, error } = await supabase.rpc('submit_vendor_for_verification', { p_vendor_id: vendorId });
  if (error) return { ok: false, error: mapOnboardingError(error) };
  return {
    ok: true,
    data: {
      id: data.id,
      businessName: data.business_name,
      slug: data.slug,
      verificationStatus: data.verification_status,
      listingStatus: data.listing_status,
    },
  };
}

function mapOnboardingError(error: { message?: string; code?: string; name?: string } | Error | null) {
  const message = (('message' in (error ?? {}) ? (error as { message?: string }).message : '') ?? '').toLowerCase();
  if (message.includes('business_name')) return { code: 'validation', message: 'Enter a valid business name.' };
  if (message.includes('category')) return { code: 'validation', message: 'Choose at least one valid category.' };
  if (message.includes('city')) return { code: 'validation', message: 'City is required before submission.' };
  if (message.includes('description')) {
    return { code: 'validation', message: 'Add a short description (at least 20 characters) before submission.' };
  }
  if (message.includes('phone') || message.includes('email')) {
    return { code: 'validation', message: 'Phone or email is required before submission.' };
  }
  if (message.includes('only the business owner')) {
    return { code: 'forbidden', message: 'Only the business owner can submit for verification.' };
  }
  if (message.includes('only unverified or rejected')) {
    return { code: 'validation', message: 'This business is already under review or verified.' };
  }
  return mapDataError(error);
}
