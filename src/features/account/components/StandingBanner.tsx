import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAccount, useActiveVendor } from '@/features/account/context/AccountContext';
import type { VendorStanding } from '@/features/account/types';
import { canManageBusiness } from '@/features/account/utils/accountState';
import { setVendorListingStatus } from '@/features/business-profile/services/businessService';
import { submitVendorForVerification } from '@/features/onboarding/services/onboardingService';
import { colors, spacing } from '@/theme';

const COPY: Record<
  Exclude<VendorStanding, 'live'>,
  { title: string; message: string; tone: 'info' | 'warning' | 'danger' }
> = {
  draft: {
    title: 'Draft listing',
    message: 'Complete your profile and submit for review before couples can find you on Kiburan.',
    tone: 'info',
  },
  pending_review: {
    title: 'Under review',
    message: 'Kiburan is reviewing your business. You can keep editing services while you wait.',
    tone: 'warning',
  },
  rejected: {
    title: 'Needs changes',
    message: 'Your listing was not approved. Update your details and submit again.',
    tone: 'danger',
  },
  verified_unpublished: {
    title: 'Ready to publish',
    message: 'Your business is verified. Publish your listing when your profile looks ready for couples.',
    tone: 'info',
  },
  suspended: {
    title: 'Listing suspended',
    message: 'This business is suspended on the marketplace. Contact support if you think this is a mistake.',
    tone: 'danger',
  },
};

export function StandingBanner() {
  const { vendor, standing } = useActiveVendor();
  const { reload } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (standing === 'live') return null;
  const copy = COPY[standing];
  const canSubmit =
    canManageBusiness(vendor.role) && vendor.isLegalOwner && (standing === 'draft' || standing === 'rejected');
  const canPublish = canManageBusiness(vendor.role) && standing === 'verified_unpublished';

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    const result = await submitVendorForVerification(vendor.vendorId);
    setLoading(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    await reload();
  };

  const onPublish = async () => {
    setError(null);
    setLoading(true);
    const result = await setVendorListingStatus(vendor.vendorId, 'published');
    setLoading(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    await reload();
  };

  return (
    <Card style={[styles.card, styles[copy.tone]]}>
      <View style={styles.text}>
        <AppText variant="headline">{copy.title}</AppText>
        <AppText color="textMuted">{copy.message}</AppText>
        {error ? (
          <AppText variant="caption" color="danger" accessibilityRole="alert">
            {error}
          </AppText>
        ) : null}
      </View>
      {canSubmit ? (
        <Button label="Submit for review" loading={loading} onPress={() => void onSubmit()} style={styles.action} />
      ) : null}
      {canPublish ? (
        <View style={styles.actions}>
          <Button label="Publish listing" loading={loading} onPress={() => void onPublish()} style={styles.action} />
          <Button
            label="Edit profile"
            variant="outline"
            disabled={loading}
            onPress={() => router.navigate('/profile/business')}
            style={styles.action}
          />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  text: {
    gap: spacing.xxs,
  },
  action: {
    alignSelf: 'stretch',
  },
  actions: {
    gap: spacing.xs,
  },
  info: {
    borderColor: colors.infoMuted,
    backgroundColor: colors.infoMuted,
  },
  warning: {
    borderColor: colors.warningMuted,
    backgroundColor: colors.warningMuted,
  },
  danger: {
    borderColor: colors.dangerMuted,
    backgroundColor: colors.dangerMuted,
  },
});
