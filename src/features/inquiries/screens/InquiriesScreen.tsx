import { router, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, InlineError } from '@/components/feedback/EmptyState';
import { LargeTitleHeader } from '@/components/layout/HeaderBar';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { FilterChips } from '@/components/ui/FilterChips';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { useActiveVendor } from '@/features/account/context/AccountContext';
import { useInquiryList } from '@/features/inquiries/hooks/useInquiries';
import type { InquiryListItem } from '@/features/inquiries/services/inquiryService';
import { INQUIRY_FILTERS, INQUIRY_PILL, type InquiryFilter } from '@/features/inquiries/utils/inquiryStatus';
import { errorMessage } from '@/lib/query/queryError';
import { colors, sizes, spacing } from '@/theme';
import { formatMoney, formatRelativeTime } from '@/utils/format';

export function InquiriesScreen() {
  const { vendor } = useActiveVendor();
  const [filter, setFilter] = useState<InquiryFilter>('all');
  const list = useInquiryList(vendor.vendorId, filter);
  const inquiries = useMemo(() => list.data?.pages.flatMap((page) => page.items) ?? [], [list.data]);

  const openInquiry = useCallback(
    (inquiryId: string) => router.push(`/messages/${inquiryId}` as Href),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: InquiryListItem }) => <InquiryCard inquiry={item} onPress={openInquiry} />,
    [openInquiry],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.inner}>
        <LargeTitleHeader title="Inquiries" />
        <AppText variant="caption" color="textMuted" style={styles.note}>
          Couples reach you through inquiries. Direct messaging is not available yet.
        </AppText>
        <View style={styles.chips}>
          <FilterChips options={INQUIRY_FILTERS} value={filter} onChange={setFilter} />
        </View>

        {list.isPending ? (
          <View style={styles.list} accessibilityLabel="Loading inquiries" accessibilityRole="progressbar">
            {[0, 1, 2, 3].map((key) => (
              <SkeletonCard key={key} height={108} />
            ))}
          </View>
        ) : list.isError ? (
          <InlineError message={errorMessage(list.error)} onRetry={() => void list.refetch()} />
        ) : (
          <FlatList
            data={inquiries}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={[styles.list, inquiries.length === 0 && styles.grow]}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
            }}
            ListEmptyComponent={
              <EmptyState
                icon="message-square"
                title={filter === 'all' ? 'No inquiries yet' : `No ${filter} inquiries`}
                message="When couples inquire about your services, they will appear here."
              />
            }
            ListFooterComponent={
              list.isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={styles.footer} /> : undefined
            }
            refreshControl={
              <RefreshControl
                refreshing={list.isRefetching && !list.isFetchingNextPage}
                onRefresh={() => void list.refetch()}
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

function InquiryCard({
  inquiry,
  onPress,
}: {
  inquiry: InquiryListItem;
  onPress: (id: string) => void;
}) {
  const pill = INQUIRY_PILL[inquiry.status];
  const title = inquiry.couple.coupleLabel ?? inquiry.serviceTitle ?? 'Inquiry';
  return (
    <Card
      onPress={() => onPress(inquiry.id)}
      accessibilityLabel={`${title}, ${pill.label}. View inquiry`}
      style={styles.card}>
      <View style={styles.cardTop}>
        <AppText variant="headline" numberOfLines={1} style={styles.flex}>
          {title}
        </AppText>
        <StatusPill label={pill.label} tone={pill.tone} />
      </View>
      {inquiry.serviceTitle ? (
        <AppText variant="caption" color="textMuted" numberOfLines={1}>
          {inquiry.serviceTitle}
        </AppText>
      ) : null}
      {inquiry.message ? (
        <AppText color="textMuted" numberOfLines={2}>
          {inquiry.message}
        </AppText>
      ) : null}
      <View style={styles.meta}>
        <AppText variant="caption" color="textMuted">
          {formatRelativeTime(inquiry.createdAt)}
        </AppText>
        {inquiry.proposedBudget != null ? (
          <AppText variant="caption" color="heading">
            Budget {formatMoney(inquiry.proposedBudget)}
          </AppText>
        ) : null}
      </View>
    </Card>
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
  note: {
    paddingHorizontal: sizes.screenPadding,
    paddingBottom: spacing.xs,
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
    marginVertical: spacing.md,
  },
  card: {
    gap: spacing.xxs,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flex: {
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xxs,
  },
});
