import type { PillTone } from '@/components/ui/StatusPill';
import type { InquiryStatus } from '@/features/inquiries/services/inquiryService';

export type InquiryFilter = 'all' | InquiryStatus;

export const INQUIRY_FILTERS: { key: InquiryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'replied', label: 'Replied' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'declined', label: 'Declined' },
  { key: 'closed', label: 'Closed' },
];

export const INQUIRY_PILL: Record<InquiryStatus, { label: string; tone: PillTone }> = {
  new: { label: 'New', tone: 'warning' },
  replied: { label: 'Replied', tone: 'info' },
  quoted: { label: 'Quoted', tone: 'info' },
  accepted: { label: 'Accepted', tone: 'success' },
  declined: { label: 'Declined', tone: 'danger' },
  closed: { label: 'Closed', tone: 'neutral' },
};
