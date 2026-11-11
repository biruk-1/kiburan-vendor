import { Feather } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, InlineError } from '@/components/feedback/EmptyState';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { FilterChips } from '@/components/ui/FilterChips';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { useActiveVendor } from '@/features/account/context/AccountContext';
import { useReviewList } from '@/features/reviews/hooks/useReviews';
import type { ReviewListItem } from '@/features/reviews/services/reviewService';
import { REVIEW_FILTERS, REVIEW_PILL, type ReviewFilter } from '@/features/reviews/utils/reviewStatus';
import { errorMessage } from '@/lib/query/queryError';
import { colors, sizes, spacing } from '@/theme';
import { formatRelativeTime } from '@/utils/format';

export function ReviewsScreen() {
  const { vendor } = useActiveVendor();
  const [filter, setFilter] = useState<ReviewFilter>('published');
  const list = useReviewList(vendor.vendorId, filter);
  const reviews = useMemo(() => list.data?.pages.flatMap((page) => page.items) ?? [], [list.data]);
  const meta = list.data?.pages[0];

  const renderItem = useCallback(({ item }: { item: ReviewListItem }) => <ReviewCard review={item} />, []);

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.inner}>
        <HeaderBar title="Reviews" />
        {meta ? (
          <View style={styles.summary}>
            <AppText variant="stat">
              {meta.publishedAverage != null ? meta.publishedAverage.toFixed(1) : '—'}
            </AppText>
            <AppText color="textMuted">
              {meta.publishedCount === 0
                ? 'No published reviews yet'
                : `${meta.publishedCount} published review${meta.publishedCount === 1 ? '' : 's'}`}
              {meta.pendingCount > 0 ? ` · ${meta.pendingCount} pending moderation` : ''}
            </AppText>
            <AppText variant="caption" color="textMuted">
              Ratings match what couples see on Kiburan. Pending reviews are not counted until published.
            </AppText>
          </View>
        ) : null}

        <View style={styles.chips}>
          <FilterChips
            options={REVIEW_FILTERS.map((option) => ({
              ...option,
              count:
                option.key === 'published'
                  ? meta?.publishedCount
                  : option.key === 'pending'
                    ? meta?.pendingCount
                    : undefined,
            }))}
            value={filter}
            onChange={setFilter}
          />
        </View>

        {list.isPending ? (
          <View style={styles.list} accessibilityLabel="Loading reviews" accessibilityRole="progressbar">
            {[0, 1, 2].map((key) => (
              <SkeletonCard key={key} height={120} />
            ))}
          </View>
        ) : list.isError ? (
          <InlineError message={errorMessage(list.error)} onRetry={() => void list.refetch()} />
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={[styles.list, reviews.length === 0 && styles.grow]}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
            }}
            ListEmptyComponent={
              <EmptyState
                icon="star"
                title={filter === 'published' ? 'No published reviews' : 'No pending reviews'}
                message={
                  filter === 'published'
                    ? 'Published couple reviews will appear here and match your marketplace rating.'
                    : 'Reviews awaiting Kiburan moderation will appear here.'
                }
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

function ReviewCard({ review }: { review: ReviewListItem }) {
  const pill = REVIEW_PILL[review.status];
  const title = review.couple.coupleLabel ?? review.reviewerDisplayName ?? 'Couple review';
  return (
    <Card style={styles.card} accessibilityLabel={`${title}, ${review.rating} stars, ${pill.label}`}>
      <View style={styles.cardTop}>
        <AppText variant="headline" numberOfLines={1} style={styles.flex}>
          {title}
        </AppText>
        <StatusPill label={pill.label} tone={pill.tone} />
      </View>
      <View style={styles.stars} accessibilityLabel={`${review.rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Feather
            key={star}
            name="star"
            size={16}
            color={star <= review.rating ? colors.primary : colors.border}
          />
        ))}
      </View>
      {review.comment ? (
        <AppText color="textMuted" numberOfLines={4}>
          {review.comment}
        </AppText>
      ) : (
        <AppText variant="caption" color="textSubtle">
          No written comment
        </AppText>
      )}
      <View style={styles.meta}>
        <AppText variant="caption" color="textMuted">
          {review.reviewerDisplayName ?? 'Reviewer'}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {formatRelativeTime(review.createdAt)}
        </AppText>
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
  summary: {
    paddingHorizontal: sizes.screenPadding,
    gap: spacing.xxs,
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
  stars: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: spacing.xxs,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xxs,
  },
});
