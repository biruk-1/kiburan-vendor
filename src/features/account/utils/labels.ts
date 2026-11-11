import type { ListingStatus, VendorRole, VendorStanding } from '@/features/account/types';

export const ROLE_LABEL: Record<VendorRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  staff: 'Staff',
};

export const LISTING_LABEL: Record<ListingStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  suspended: 'Suspended',
};

export const STANDING_LABEL: Record<VendorStanding, string> = {
  draft: 'Not submitted for verification',
  pending_review: 'Verification pending',
  rejected: 'Verification rejected',
  verified_unpublished: 'Verified · listing not published',
  live: 'Verified · live on Kiburan',
  suspended: 'Listing suspended',
};
