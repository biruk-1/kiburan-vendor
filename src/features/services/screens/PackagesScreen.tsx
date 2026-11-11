import { Feather } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState, InlineError } from '@/components/feedback/EmptyState';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Screen } from '@/components/layout/Screen';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { useActiveVendor } from '@/features/account/context/AccountContext';
import { canManageBusiness } from '@/features/account/utils/accountState';
import { useDeletePackage, usePackages, useService } from '@/features/services/hooks/useServices';
import type { ServicePackage } from '@/features/services/services/packageCatalog';
import { errorMessage } from '@/lib/query/queryError';
import { colors, spacing } from '@/theme';
import { formatMoney } from '@/utils/format';

export function PackagesScreen({ serviceId }: { serviceId: string }) {
  const { vendor } = useActiveVendor();
  const canManage = canManageBusiness(vendor.role);
  const service = useService(vendor.vendorId, serviceId);
  const packages = usePackages(vendor.vendorId, serviceId);
  const remove = useDeletePackage(vendor.vendorId, serviceId);
  const [pendingDelete, setPendingDelete] = useState<ServicePackage | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  return (
    <Screen
      scroll
      edges={['top']}
      header={
        <HeaderBar
          title="Packages"
          right={
            canManage ? (
              <IconButton
                icon="plus"
                variant="filled"
                accessibilityLabel="Add package"
                onPress={() => router.push(`/services/${serviceId}/packages/new` as Href)}
              />
            ) : null
          }
        />
      }>
      <AppText color="textMuted">
        {service.data ? `Packages for ${service.data.title}.` : 'Packages belong to this service.'} Couples see active
        packages on your public listing.
      </AppText>

      {actionError ? (
        <AppText variant="caption" color="danger" accessibilityRole="alert">
          {actionError}
        </AppText>
      ) : null}

      {packages.isPending ? (
        <SkeletonCard height={160} />
      ) : packages.isError ? (
        <InlineError message={errorMessage(packages.error)} onRetry={() => void packages.refetch()} />
      ) : packages.data.length === 0 ? (
        <EmptyState
          icon="package"
          title="No packages yet"
          message="Add named packages with prices and inclusions for this service."
          actionLabel={canManage ? 'Add package' : undefined}
          onAction={canManage ? () => router.push(`/services/${serviceId}/packages/new` as Href) : undefined}
        />
      ) : (
        packages.data.map((item) => (
          <Card key={item.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.text}>
                <AppText variant="headline">{item.name}</AppText>
                <AppText color="textMuted">
                  {item.price == null ? 'Price on request' : formatMoney(item.price, item.currencyCode)}
                </AppText>
                {item.inclusions.length ? (
                  <AppText variant="caption" color="textMuted" numberOfLines={2}>
                    {item.inclusions.join(' · ')}
                  </AppText>
                ) : null}
              </View>
              <StatusPill label={item.isActive ? 'Active' : 'Inactive'} tone={item.isActive ? 'success' : 'neutral'} />
            </View>
            {canManage ? (
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(`/services/${serviceId}/packages/${item.id}` as Href)}
                  style={styles.action}>
                  <Feather name="edit-2" size={16} color={colors.primaryDark} />
                  <AppText variant="caption" color="primaryDark">
                    Edit
                  </AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPendingDelete(item)}
                  style={styles.action}>
                  <Feather name="trash-2" size={16} color={colors.danger} />
                  <AppText variant="caption" color="danger">
                    Delete
                  </AppText>
                </Pressable>
              </View>
            ) : null}
          </Card>
        ))
      )}

      <ActionSheet
        visible={Boolean(pendingDelete)}
        title={pendingDelete ? `Delete “${pendingDelete.name}”?` : ''}
        message="This cannot be undone. Packages linked to quotes cannot be deleted."
        onClose={() => setPendingDelete(null)}
        actions={[
          {
            label: 'Delete package',
            icon: 'trash-2',
            destructive: true,
            onPress: () => {
              if (!pendingDelete) return;
              setActionError(null);
              void remove
                .mutateAsync(pendingDelete.id)
                .catch((error) => setActionError(errorMessage(error)));
            },
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
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
});
