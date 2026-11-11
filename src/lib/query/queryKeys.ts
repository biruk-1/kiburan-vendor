/**
 * Every key starts with the scope that owns the data so caches can be dropped precisely:
 * - ['user', userId, ...]     data about the signed-in person (cleared on sign-out / user change)
 * - ['vendor', vendorId, ...] one business's data (cleared on business switch)
 * - ['reference', ...]        shared lookup data (categories)
 */
export const queryKeys = {
  myVendors: (userId: string) => ['user', userId, 'my-vendors'] as const,
  myProfile: (userId: string) => ['user', userId, 'profile'] as const,
  vendorScope: (vendorId: string) => ['vendor', vendorId] as const,
  vendorDetails: (vendorId: string) => ['vendor', vendorId, 'details'] as const,
  vendorImages: (vendorId: string) => ['vendor', vendorId, 'images'] as const,
  vendorPortfolio: (vendorId: string) => ['vendor', vendorId, 'portfolio'] as const,
  reviewSummary: (vendorId: string) => ['vendor', vendorId, 'reviews', 'summary'] as const,
  reviews: (vendorId: string) => ['vendor', vendorId, 'reviews'] as const,
  reviewList: (vendorId: string, filter: string) => ['vendor', vendorId, 'reviews', 'list', filter] as const,
  earnings: (vendorId: string) => ['vendor', vendorId, 'earnings'] as const,
  dashboard: (vendorId: string) => ['vendor', vendorId, 'dashboard'] as const,
  inquiries: (vendorId: string) => ['vendor', vendorId, 'inquiries'] as const,
  inquiryList: (vendorId: string, filter: string) => ['vendor', vendorId, 'inquiries', 'list', filter] as const,
  inquiry: (vendorId: string, inquiryId: string) => ['vendor', vendorId, 'inquiries', 'detail', inquiryId] as const,
  bookings: (vendorId: string) => ['vendor', vendorId, 'bookings'] as const,
  bookingList: (vendorId: string, filter: string) => ['vendor', vendorId, 'bookings', 'list', filter] as const,
  bookingCounts: (vendorId: string) => ['vendor', vendorId, 'bookings', 'counts'] as const,
  booking: (vendorId: string, bookingId: string) => ['vendor', vendorId, 'bookings', 'detail', bookingId] as const,
  clientCount: (vendorId: string) => ['vendor', vendorId, 'bookings', 'clients'] as const,
  services: (vendorId: string) => ['vendor', vendorId, 'services'] as const,
  service: (vendorId: string, serviceId: string) => ['vendor', vendorId, 'services', serviceId] as const,
  servicePhotos: (vendorId: string, serviceId: string) =>
    ['vendor', vendorId, 'services', serviceId, 'photos'] as const,
  servicePackages: (vendorId: string, serviceId: string) =>
    ['vendor', vendorId, 'services', serviceId, 'packages'] as const,
  servicePackage: (vendorId: string, serviceId: string, packageId: string) =>
    ['vendor', vendorId, 'services', serviceId, 'packages', packageId] as const,
  availability: (vendorId: string) => ['vendor', vendorId, 'availability'] as const,
  vendorCategories: () => ['reference', 'vendor-categories'] as const,
};

export const staleTimes = {
  /** Inquiries, bookings, counts — change often, refetch on focus. */
  operational: 30_000,
  /** Business profile, services, team. */
  profile: 5 * 60_000,
  /** Categories and other lookup tables. */
  reference: 60 * 60_000,
} as const;
