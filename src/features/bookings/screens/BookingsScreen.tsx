import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, InlineError } from '@/components/feedback/EmptyState';
import { LargeTitleHeader } from '@/components/layout/HeaderBar';
import { FilterChips } from '@/components/ui/FilterChips';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useActiveVendor } from '@/features/account/context/AccountContext';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { useBookingCounts, useBookingList } from '@/features/bookings/hooks/useBookings';
import type { Booking } from '@/features/bookings/services/bookingService';
import { BOOKING_FILTERS, type BookingFilter } from '@/features/bookings/utils/bookingStatus';
import { useVendorImages } from '@/features/business-profile/hooks/useBusinessQueries';
import { errorMessage } from '@/lib/query/queryError';
import { colors, sizes, spacing } from '@/theme';

const EMPTY_COPY: Record<BookingFilter, { title: string; message: string }> = {
  all: {
    title: 'No bookings yet',
    message:
      'Bookings appear after a couple accepts your quote in the Kiburan wedding app. That client path is not wired yet.',
  },
  pending: { title: 'No pending bookings', message: 'Booking requests waiting for your answer will appear here.' },
  confirmed: { title: 'No confirmed bookings', message: 'Bookings you have confirmed will appear here.' },
  completed: { title: 'No completed bookings', message: 'Finished events will appear here.' },
  cancelled: { title: 'No cancelled bookings', message: 'Cancelled bookings will appear here.' },
};

export function BookingsScreen() {
  const { vendor } = useActiveVendor();
  const [filter, setFilter] = useState<BookingFilter>('all');
  const list = useBookingList(vendor.vendorId, filter);
  const counts = useBookingCounts(vendor.vendorId);
  const images = useVendorImages(vendor.vendorId);

  const bookings = useMemo(() => list.data?.pages.flatMap((page) => page.items) ?? [], [list.data]);
  const chipOptions = BOOKING_FILTERS.map((option) => ({ ...option, count: counts.data?.[option.key] }));

  const openBooking = useCallback(
    (bookingId: string) => router.push({ pathname: '/bookings/[bookingId]', params: { bookingId } }),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: Booking }) => (
      <BookingCard
        booking={item}
        imageUri={(item.serviceId ? images.data?.byService[item.serviceId] : undefined) ?? images.data?.first ?? null}
        onPress={openBooking}
      />
    ),
    [images.data, openBooking],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.inner}>
        <LargeTitleHeader title="Bookings" />
        <View style={styles.chips}>
          <FilterChips options={chipOptions} value={filter} onChange={setFilter} />
        </View>

        {list.isPending ? (
          <View style={styles.list} accessibilityLabel="Loading bookings" accessibilityRole="progressbar">
            {[0, 1, 2, 3].map((key) => (
              <SkeletonCard key={key} height={108} />
            ))}
          </View>
        ) : list.isError ? (
          <InlineError message={errorMessage(list.error)} onRetry={() => void list.refetch()} />
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={[styles.list, bookings.length === 0 && styles.grow]}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
            }}
            ListEmptyComponent={<EmptyState icon="calendar" {...EMPTY_COPY[filter]} />}
            ListFooterComponent={
              list.isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={styles.footer} /> : undefined
            }
            refreshControl={
              <RefreshControl
                refreshing={list.isRefetching && !list.isFetchingNextPage}
                onRefresh={() => {
                  void list.refetch();
                  void counts.refetch();
                }}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        )}
      </View>
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
  chips: {
    paddingVertical: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    paddingHorizontal: sizes.screenPadding,
    paddingBottom: spacing.lg,
  },
  grow: {
    flexGrow: 1,
  },
  footer: {
    paddingVertical: spacing.md,
  },
});
