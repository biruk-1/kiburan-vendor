import type {
  AccountState,
  ListingStatus,
  VendorMembership,
  VendorRole,
  VendorStanding,
  VerificationStatus,
} from '@/features/account/types';

const VERIFICATION: readonly VerificationStatus[] = ['unverified', 'pending', 'verified', 'rejected'];
const LISTING: readonly ListingStatus[] = ['draft', 'published', 'suspended'];
const ROLES: readonly VendorRole[] = ['owner', 'manager', 'staff'];

/** Unknown values fall back to the most restrictive state rather than being trusted. */
export function parseVerificationStatus(value: string): VerificationStatus {
  return (VERIFICATION as readonly string[]).includes(value) ? (value as VerificationStatus) : 'unverified';
}

export function parseListingStatus(value: string): ListingStatus {
  return (LISTING as readonly string[]).includes(value) ? (value as ListingStatus) : 'draft';
}

export function parseVendorRole(value: string): VendorRole {
  return (ROLES as readonly string[]).includes(value) ? (value as VendorRole) : 'staff';
}

export function vendorStanding(
  vendor: Pick<VendorMembership, 'verificationStatus' | 'listingStatus'>,
): VendorStanding {
  if (vendor.listingStatus === 'suspended') return 'suspended';
  if (vendor.verificationStatus === 'rejected') return 'rejected';
  if (vendor.verificationStatus === 'pending') return 'pending_review';
  if (vendor.verificationStatus === 'verified') {
    return vendor.listingStatus === 'published' ? 'live' : 'verified_unpublished';
  }
  return 'draft';
}

/** Owner and manager may edit the business; staff are read-mostly (mirrors `private.can_manage_vendor`). */
export function canManageBusiness(role: VendorRole): boolean {
  return role === 'owner' || role === 'manager';
}

export type ResolveAccountInput = {
  isRestoring: boolean;
  hasSession: boolean;
  vendors:
    | { status: 'pending' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: VendorMembership[] };
  /** Persisted choice; `undefined` while it is still being read from storage. */
  preferredVendorId: string | null | undefined;
};

export function resolveAccountState(input: ResolveAccountInput): AccountState {
  if (input.isRestoring) return { kind: 'restoring' };
  if (!input.hasSession) return { kind: 'signed_out' };
  if (input.vendors.status === 'pending' || input.preferredVendorId === undefined) {
    return { kind: 'loading_businesses' };
  }
  if (input.vendors.status === 'error') return { kind: 'error', message: input.vendors.message };

  const vendors = input.vendors.data;
  if (vendors.length === 0) return { kind: 'no_business' };

  const chosen =
    vendors.length === 1
      ? vendors[0]
      : vendors.find((vendor) => vendor.vendorId === input.preferredVendorId);
  if (!chosen) return { kind: 'choose_business', vendors };

  return { kind: 'workspace', vendor: chosen, standing: vendorStanding(chosen), vendors };
}
