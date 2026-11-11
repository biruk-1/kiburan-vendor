import { router, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, InlineError } from '@/components/feedback/EmptyState';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { ActionSheet, type SheetAction } from '@/components/ui/ActionSheet';
import { AppText } from '@/components/ui/AppText';
import { FilterChips } from '@/components/ui/FilterChips';
import { IconButton } from '@/components/ui/IconButton';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useActiveVendor } from '@/features/account/context/AccountContext';
import { canManageBusiness } from '@/features/account/utils/accountState';
import { useVendorImages } from '@/features/business-profile/hooks/useBusinessQueries';
import { ServiceGridCard } from '@/features/services/components/ServiceGridCard';
import { useDeleteService, useServices, useSetServiceActive } from '@/features/services/hooks/useServices';
import type { VendorService } from '@/features/services/services/serviceCatalog';
import { errorMessage } from '@/lib/query/queryError';
import { colors, sizes, spacing } from '@/theme';

type ServiceFilter = 'all' | 'active' | 'inactive';

type SheetState = { kind: 'menu' | 'confirm-delete'; service: VendorService } | null;

export function ServicesScreen() {
  const { vendor } = useActiveVendor();
  const canManage = canManageBusiness(vendor.role);
  const { width } = useWindowDimensions();
  const columns = width >= 600 ? 3 : 2;

  const services = useServices(vendor.vendorId);
  const images = useVendorImages(vendor.vendorId);
  const setActive = useSetServiceActive(vendor.vendorId);
  const remove = useDeleteService(vendor.vendorId);

  const [filter, setFilter] = useState<ServiceFilter>('all');
  const [sheet, setSheet] = useState<SheetState>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const all = useMemo(() => services.data ?? [], [services.data]);
  const visible = useMemo(
    () => (filter === 'all' ? all : all.filter((service) => service.isActive === (filter === 'active'))),
    [all, filter],
  );
  const activeCount = all.filter((service) => service.isActive).length;

  const openEditor = useCallback(
    (service: VendorService) =>
      router.push({ pathname: '/services/[serviceId]/edit', params: { serviceId: service.id } }),
    [],
  );
  const openMenu = useCallback((service: VendorService) => setSheet({ kind: 'menu', service }), []);

  const runAction = (action: Promise<unknown>) => {
    setActionError(null);
    action.catch((error: unknown) => setActionError(errorMessage(error)));
  };

  const sheetActions: SheetAction[] = !sheet
    ? []
    : sheet.kind === 'menu'
      ? [
          { label: 'Edit service', icon: 'edit-2', onPress: () => openEditor(sheet.service) },
          {
            label: 'Packages',
            icon: 'package',
            onPress: () => router.push(`/services/${sheet.service.id}/packages` as Href),
          },
          {
            label: sheet.service.isActive ? 'Deactivate' : 'Activate',
            icon: sheet.service.isActive ? 'eye-off' : 'eye',
            onPress: () =>
              runAction(setActive.mutateAsync({ serviceId: sheet.service.id, isActive: !sheet.service.isActive })),
          },
          {
            label: 'Delete service',
            icon: 'trash-2',
            destructive: true,
            onPress: () => setSheet({ kind: 'confirm-delete', service: sheet.service }),
          },
        ]
      : [
          {
            label: 'Delete service',
            icon: 'trash-2',
            destructive: true,
            onPress: () => runAction(remove.mutateAsync(sheet.service.id)),
          },
        ];

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.inner}>
        <HeaderBar
          title="My Services"
          showBack={false}
          right={
            <View style={styles.headerActions}>
              {canManage ? (
                <IconButton
                  icon="calendar"
                  accessibilityLabel="Availability"
                  onPress={() => router.push('/services/availability' as Href)}
                />
              ) : null}
              {canManage ? (
                <IconButton
                  icon="plus"
                  variant="filled"
                  accessibilityLabel="Add service"
                  onPress={() => router.push('/services/new')}
                />
              ) : null}
            </View>
          }
        />
        <View style={styles.chips}>
          <FilterChips<ServiceFilter>
            options={[
              { key: 'all', label: 'All', count: services.data ? all.length : undefined },
              { key: 'active', label: 'Active', count: services.data ? activeCount : undefined },
              { key: 'inactive', label: 'Inactive', count: services.data ? all.length - activeCount : undefined },
            ]}
            value={filter}
            onChange={setFilter}
          />
        </View>
        {actionError ? (
          <AppText variant="caption" color="danger" style={styles.actionError} accessibilityRole="alert">
            {actionError}
          </AppText>
        ) : null}
        {!canManage ? (
          <AppText variant="caption" color="textMuted" style={styles.actionError}>
            Only owners and managers can change services.
          </AppText>
        ) : null}

        {services.isPending ? (
          <View style={styles.skeletonGrid} accessibilityLabel="Loading services" accessibilityRole="progressbar">
            {[0, 1, 2, 3].map((key) => (
              <SkeletonCard key={key} height={190} style={styles.skeletonCell} />
            ))}
          </View>
        ) : services.isError ? (
          <InlineError message={errorMessage(services.error)} onRetry={() => void services.refetch()} />
        ) : (
          <FlatList
            key={columns}
            data={visible}
            numColumns={columns}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={styles.row}
            contentContainerStyle={[styles.grid, visible.length === 0 && styles.grow]}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View style={[styles.cell, { maxWidth: `${100 / columns}%` }, index % columns !== 0 && styles.cellGap]}>
                <ServiceGridCard
                  service={item}
                  imageUri={images.data?.byService[item.id] ?? null}
                  onPress={canManage ? openEditor : undefined}
                  onMenu={canManage ? openMenu : undefined}
                />
              </View>
            )}
            ListEmptyComponent={
              filter === 'all' ? (
                <EmptyState
                  icon="briefcase"
                  title="No services yet"
                  message="Add the services couples can book from your business."
                  actionLabel={canManage ? 'Add your first service' : undefined}
                  onAction={canManage ? () => router.push('/services/new') : undefined}
                />
              ) : (
                <EmptyState icon="briefcase" title={`No ${filter} services`} />
              )
            }
            refreshControl={
              <RefreshControl
                refreshing={services.isRefetching}
                onRefresh={() => void services.refetch()}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        )}
      </View>

      <ActionSheet
        visible={sheet !== null}
        title={sheet?.kind === 'confirm-delete' ? `Delete “${sheet.service.title}”?` : (sheet?.service.title ?? '')}
        message={
          sheet?.kind === 'confirm-delete'
            ? 'Its packages and availability entries are deleted too. This cannot be undone.'
            : undefined
        }
        actions={sheetActions}
        onClose={() => setSheet(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: sizes.maxContentWidth,
    alignSelf: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  chips: {
    paddingVertical: spacing.sm,
  },
  actionError: {
    paddingHorizontal: sizes.screenPadding,
    paddingBottom: spacing.xs,
  },
  grid: {
    gap: spacing.sm,
    paddingHorizontal: sizes.screenPadding,
    paddingBottom: spacing.lg,
  },
  grow: {
    flexGrow: 1,
  },
  row: {
    alignItems: 'stretch',
  },
  cell: {
    flex: 1,
  },
  cellGap: {
    marginLeft: spacing.sm,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: sizes.screenPadding,
  },
  skeletonCell: {
    width: '48%',
  },
});
