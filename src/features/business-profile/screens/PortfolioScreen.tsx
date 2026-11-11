import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState, InlineError } from '@/components/feedback/EmptyState';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Screen } from '@/components/layout/Screen';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Thumb } from '@/components/ui/Thumb';
import { useActiveVendor } from '@/features/account/context/AccountContext';
import { canManageBusiness } from '@/features/account/utils/accountState';
import {
  useAddPortfolioImage,
  useDeletePortfolioImage,
  usePortfolioMedia,
} from '@/features/business-profile/hooks/useBusinessQueries';
import type { PortfolioItem } from '@/features/business-profile/services/businessService';
import { pickVendorImage, uploadVendorPublicImage } from '@/features/business-profile/services/vendorStorage';
import { errorMessage } from '@/lib/query/queryError';
import { colors, radii, spacing } from '@/theme';

export function PortfolioScreen() {
  const { vendor } = useActiveVendor();
  const portfolio = usePortfolioMedia(vendor.vendorId);
  const addImage = useAddPortfolioImage(vendor.vendorId);
  const deleteImage = useDeletePortfolioImage(vendor.vendorId);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PortfolioItem | null>(null);

  const canEdit = canManageBusiness(vendor.role);

  const onAdd = async () => {
    setError(null);
    setUploading(true);
    try {
      const picked = await pickVendorImage();
      if (!picked.ok) {
        setError(picked.error.message);
        return;
      }
      if (!picked.data) return;
      const uploaded = await uploadVendorPublicImage({
        vendorId: vendor.vendorId,
        kind: 'portfolio',
        picked: picked.data,
      });
      if (!uploaded.ok) {
        setError(uploaded.error.message);
        return;
      }
      await addImage.mutateAsync(uploaded.data.publicUrl);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  if (!canEdit) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Portfolio" />}>
        <EmptyState icon="lock" title="Managers only" message="Only owners and managers can manage portfolio photos." />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['top']} header={<HeaderBar title="Portfolio" />}>
      <AppText color="textMuted">
        These photos appear on your public business page. Service-specific photos are managed with each service later.
      </AppText>

      {error ? (
        <AppText variant="caption" color="danger" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}

      <Button label="Add photo" icon="plus" loading={uploading || addImage.isPending} onPress={() => void onAdd()} />

      {portfolio.isPending ? (
        <SkeletonCard height={220} />
      ) : portfolio.isError ? (
        <InlineError message={errorMessage(portfolio.error)} onRetry={() => void portfolio.refetch()} />
      ) : portfolio.data.length === 0 ? (
        <EmptyState
          icon="image"
          title="No portfolio photos yet"
          message="Add photos of your real work so couples can see what you offer."
        />
      ) : (
        <FlatList
          data={portfolio.data}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Portfolio photo. Double tap to delete."
              onLongPress={() => setPendingDelete(item)}
              onPress={() => setPendingDelete(item)}
              style={({ pressed }) => [styles.cell, pressed && styles.pressed]}>
              <Thumb uri={item.url} style={styles.thumb} />
              <View style={styles.deleteHint}>
                <Feather name="trash-2" size={14} color={colors.onPrimary} />
              </View>
            </Pressable>
          )}
        />
      )}

      <ActionSheet
        visible={Boolean(pendingDelete)}
        title="Remove photo?"
        message="This deletes the photo from your portfolio. Couples will no longer see it."
        onClose={() => setPendingDelete(null)}
        actions={[
          {
            label: 'Delete photo',
            icon: 'trash-2',
            destructive: true,
            onPress: () => {
              if (!pendingDelete) return;
              void deleteImage
                .mutateAsync({ mediaId: pendingDelete.id, publicUrl: pendingDelete.url })
                .catch((err) => setError(errorMessage(err)));
            },
          },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  row: {
    gap: spacing.sm,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  deleteHint: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  pressed: {
    opacity: 0.85,
  },
});
