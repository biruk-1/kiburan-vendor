export type VendorRole = 'owner' | 'manager' | 'staff';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type ListingStatus = 'draft' | 'published' | 'suspended';

/** A business the signed-in user may operate, and the role they hold in it. */
export type VendorMembership = {
  vendorId: string;
  businessName: string;
  slug: string;
  logoUrl: string | null;
  verificationStatus: VerificationStatus;
  listingStatus: ListingStatus;
  role: VendorRole;
  /** `vendors.owner_user_id` — the single legal owner, distinct from team role `owner`. */
  isLegalOwner: boolean;
};

/**
 * How the business stands in the marketplace lifecycle, derived only from
 * `verification_status` and `listing_status` (no approval system is invented).
 */
export type VendorStanding =
  | 'draft'
  | 'pending_review'
  | 'rejected'
  | 'verified_unpublished'
  | 'live'
  | 'suspended';

export type AccountState =
  | { kind: 'restoring' }
  | { kind: 'signed_out' }
  | { kind: 'loading_businesses' }
  | { kind: 'error'; message: string }
  | { kind: 'no_business' }
  | { kind: 'choose_business'; vendors: VendorMembership[] }
  | {
      kind: 'workspace';
      vendor: VendorMembership;
      standing: VendorStanding;
      vendors: VendorMembership[];
    };
