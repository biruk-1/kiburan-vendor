import type { VendorMembership } from '@/features/account/types';
import {
  parseListingStatus,
  parseVendorRole,
  parseVerificationStatus,
} from '@/features/account/utils/accountState';
import { mapDataError, type ServiceResult } from '@/lib/query/queryError';
import { supabase } from '@/lib/supabase/client';

const VENDOR_COLUMNS = 'id, business_name, slug, logo_url, verification_status, listing_status, owner_user_id';

type VendorRow = {
  id: string;
  business_name: string;
  slug: string;
  logo_url: string | null;
  verification_status: string;
  listing_status: string;
  owner_user_id: string;
};

function toMembership(row: VendorRow, userId: string, teamRole: string | null): VendorMembership {
  const isLegalOwner = row.owner_user_id === userId;
  return {
    vendorId: row.id,
    businessName: row.business_name,
    slug: row.slug,
    logoUrl: row.logo_url,
    verificationStatus: parseVerificationStatus(row.verification_status),
    listingStatus: parseListingStatus(row.listing_status),
    role: isLegalOwner ? 'owner' : parseVendorRole(teamRole ?? 'staff'),
    isLegalOwner,
  };
}

/**
 * Businesses the user owns (`vendors.owner_user_id`) or belongs to (`vendor_team_members`).
 * RLS limits both reads to the caller's own rows; the filters here only shape the result.
 */
export async function listMyVendors(userId: string): Promise<ServiceResult<VendorMembership[]>> {
  const [owned, team] = await Promise.all([
    supabase.from('vendors').select(VENDOR_COLUMNS).eq('owner_user_id', userId),
    supabase.from('vendor_team_members').select(`role, vendor:vendors ( ${VENDOR_COLUMNS} )`).eq('user_id', userId),
  ]);

  if (owned.error) return { ok: false, error: mapDataError(owned.error) };
  if (team.error) return { ok: false, error: mapDataError(team.error) };

  const byId = new Map<string, VendorMembership>();
  for (const row of team.data ?? []) {
    const vendorRow = (Array.isArray(row.vendor) ? row.vendor[0] : row.vendor) as VendorRow | null;
    if (vendorRow) byId.set(vendorRow.id, toMembership(vendorRow, userId, row.role));
  }
  for (const row of owned.data ?? []) {
    byId.set(row.id, toMembership(row, userId, null));
  }

  const memberships = [...byId.values()].sort((a, b) => a.businessName.localeCompare(b.businessName));
  return { ok: true, data: memberships };
}
