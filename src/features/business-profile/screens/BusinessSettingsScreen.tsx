import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/EmptyState';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Screen } from '@/components/layout/Screen';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/StatusPill';
import { VerificationPill } from '@/features/account/components/VerificationPill';
import { useAccount, useActiveVendor } from '@/features/account/context/AccountContext';
import { canManageBusiness } from '@/features/account/utils/accountState';
import { useSetListingStatus } from '@/features/business-profile/hooks/useBusinessQueries';
import { LISTING_LABEL } from '@/features/account/utils/labels';
import { errorMessage } from '@/lib/query/queryError';
import { spacing } from '@/theme';

export function BusinessSettingsScreen() {
  const { vendor, standing } = useActiveVendor();
  const { reload } = useAccount();
  const setListing = useSetListingStatus(vendor.vendorId);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'publish' | 'unpublish' | null>(null);

  if (!canManageBusiness(vendor.role)) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Business Settings" />}>
        <EmptyState icon="lock" title="Managers only" message="Only owners and managers can change listing settings." />
      </Screen>
    );
  }

  const canPublish = vendor.verificationStatus === 'verified' && vendor.listingStatus === 'draft';
  const canUnpublish = vendor.verificationStatus === 'verified' && vendor.listingStatus === 'published';
  const suspended = vendor.listingStatus === 'suspended';

  const applyListing = async (listingStatus: 'draft' | 'published') => {
    setError(null);
    try {
      await setListing.mutateAsync(listingStatus);
      await reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <Screen scroll edges={['top']} header={<HeaderBar title="Business Settings" />}>
      <Card style={styles.card}>
        <AppText variant="headline">Marketplace status</AppText>
        <View style={styles.row}>
          <VerificationPill status={vendor.verificationStatus} />
          <StatusPill label={LISTING_LABEL[vendor.listingStatus]} tone={standing === 'live' ? 'success' : 'neutral'} />
        </View>
        <AppText color="textMuted">
          {standing === 'live'
            ? 'Your listing is live. Couples who match your categories can find you.'
            : standing === 'verified_unpublished'
              ? 'You are verified. Publish when your profile and services are ready.'
              : standing === 'suspended'
                ? 'Kiburan suspended this listing. Contact support if you need it restored.'
                : 'Listing visibility follows verification. You can publish only after Kiburan verifies the business.'}
        </AppText>
      </Card>

      {error ? (
        <AppText variant="caption" color="danger" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}

      {canPublish ? (
        <Button label="Publish listing" loading={setListing.isPending} onPress={() => setConfirm('publish')} />
      ) : null}
      {canUnpublish ? (
        <Button
          label="Unpublish listing"
          variant="outline"
          loading={setListing.isPending}
          onPress={() => setConfirm('unpublish')}
        />
      ) : null}
      {suspended ? (
        <AppText color="textMuted">Publishing controls are locked while the listing is suspended.</AppText>
      ) : null}
      {!canPublish && !canUnpublish && !suspended ? (
        <AppText color="textMuted">
          Publish / unpublish becomes available after your business is verified by Kiburan.
        </AppText>
      ) : null}

      <ActionSheet
        visible={confirm === 'publish'}
        title="Publish listing?"
        message="Your business will appear in the marketplace for couples who match your categories."
        onClose={() => setConfirm(null)}
        actions={[
          {
            label: 'Publish now',
            icon: 'check-circle',
            onPress: () => void applyListing('published'),
          },
        ]}
      />
      <ActionSheet
        visible={confirm === 'unpublish'}
        title="Unpublish listing?"
        message="Couples will no longer find this business in the marketplace until you publish again."
        onClose={() => setConfirm(null)}
        actions={[
          {
            label: 'Unpublish',
            icon: 'eye-off',
            destructive: true,
            onPress: () => void applyListing('draft'),
          },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
