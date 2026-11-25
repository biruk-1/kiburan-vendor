import { useDashboard } from '@/features/dashboard/hooks/useDashboard';

export type VendorAlertCounts = {
  newInquiries: number;
  pendingBookings: number;
  total: number;
};

/** Shared counts for tab badges and the Needs attention banner. */
export function useVendorAlertCounts(vendorId: string | undefined): VendorAlertCounts {
  const dashboard = useDashboard(vendorId ?? '', { enabled: Boolean(vendorId) });
  const newInquiries = dashboard.data?.newInquiries ?? 0;
  const pendingBookings = dashboard.data?.pendingBookings ?? 0;
  return {
    newInquiries,
    pendingBookings,
    total: newInquiries + pendingBookings,
  };
}
