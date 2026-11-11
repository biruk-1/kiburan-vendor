import { StatusPill, type PillTone } from '@/components/ui/StatusPill';
import type { VerificationStatus } from '@/features/account/types';

const PILL: Record<VerificationStatus, { label: string; tone: PillTone; icon: 'check-circle' | 'clock' | 'x-circle' | 'shield' }> = {
  verified: { label: 'Business Verified', tone: 'success', icon: 'check-circle' },
  pending: { label: 'Verification pending', tone: 'warning', icon: 'clock' },
  unverified: { label: 'Not verified', tone: 'neutral', icon: 'shield' },
  rejected: { label: 'Verification rejected', tone: 'danger', icon: 'x-circle' },
};

export function VerificationPill({ status, label }: { status: VerificationStatus; label?: string }) {
  const pill = PILL[status];
  return <StatusPill label={label && status === 'verified' ? label : pill.label} tone={pill.tone} icon={pill.icon} />;
}
