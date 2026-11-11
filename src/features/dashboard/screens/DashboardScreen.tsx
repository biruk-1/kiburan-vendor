import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Sparkline } from '@/components/charts/Sparkline';
import { InlineError } from '@/components/feedback/EmptyState';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { StandingBanner } from '@/features/account/components/StandingBanner';
import { VerificationPill } from '@/features/account/components/VerificationPill';
import { useAccount, useActiveVendor } from '@/features/account/context/AccountContext';
import { useMyDisplayName } from '@/features/business-profile/hooks/useBusinessQueries';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import type { Activity, ActivityKind, DashboardData } from '@/features/dashboard/services/dashboardService';
import { errorMessage } from '@/lib/query/queryError';
import { colors, radii, spacing } from '@/theme';
import { firstName, formatMoney, formatRelativeTime, greetingForHour } from '@/utils/format';

const promoImage = require('@/assets/images/brand/promo-banner.jpg');

const ACTIVITY_ICON: Record<ActivityKind, ComponentProps<typeof Feather>['name']> = {
  inquiry: 'message-square',
  booking: 'calendar',
  review: 'star',
};

export function DashboardScreen() {
  const { vendor, vendors } = useActiveVendor();
  const { clearSelection } = useAccount();
  const displayName = useMyDisplayName();
  const dashboard = useDashboard(vendor.vendorId);

  const name = firstName(displayName.data) ?? vendor.businessName;
  const refreshing = dashboard.isRefetching;

  return (
    <Screen
      scroll
      edges={['top']}
      refreshing={refreshing}
      onRefresh={() => {
        void dashboard.refetch();
      }}>
      <View style={styles.businessRow}>
        <Avatar name={vendor.businessName} uri={vendor.logoUrl} fallback="brand" size={48} ring />
        <View style={styles.businessText}>
          <Pressable
            accessibilityRole={vendors.length > 1 ? 'button' : undefined}
            accessibilityLabel={vendors.length > 1 ? `${vendor.businessName}. Switch business` : vendor.businessName}
            disabled={vendors.length < 2}
            onPress={() => void clearSelection()}
            style={styles.nameRow}>
            <AppText variant="headline" numberOfLines={1} style={styles.shrink}>
              {vendor.businessName}
            </AppText>
            {vendors.length > 1 ? <Feather name="chevron-down" size={16} color={colors.heading} /> : null}
          </Pressable>
          <VerificationPill status={vendor.verificationStatus} />
        </View>
      </View>

      <View style={styles.greeting}>
        <AppText variant="greeting" accessibilityRole="header">
          {greetingForHour(new Date().getHours())},{'\n'}
          {name}!
        </AppText>
        <AppText color="textMuted">Here&apos;s your business overview</AppText>
      </View>

      <StandingBanner />

      {dashboard.isPending ? (
        <DashboardSkeleton />
      ) : dashboard.isError ? (
        <Card>
          <InlineError message={errorMessage(dashboard.error)} onRetry={() => void dashboard.refetch()} />
        </Card>
      ) : (
        <>
          <Card padded={false} style={styles.stats}>
            <StatTile
              icon="message-square"
              value={String(dashboard.data.newInquiries)}
              label="New Inquiries"
              onPress={() => router.navigate('/messages' as Href)}
            />
            <View style={styles.statDivider} />
            <StatTile
              icon="package"
              value={String(dashboard.data.activeBookings)}
              label="Bookings"
              onPress={() => router.navigate('/bookings')}
            />
            <View style={styles.statDivider} />
            <StatTile
              icon="star"
              value={dashboard.data.reviewAverage != null ? dashboard.data.reviewAverage.toFixed(1) : '—'}
              label={dashboard.data.reviewCount === 0 ? 'No reviews yet' : 'Rating'}
              onPress={() => router.navigate('/profile/reviews' as Href)}
            />
          </Card>

          <BookingValueCard
            summary={dashboard.data.bookingValue}
            onPress={() => router.navigate('/profile/earnings' as Href)}
          />

          <View style={styles.sectionHeader}>
            <AppText variant="headline">Recent Activities</AppText>
          </View>
          <ActivityList items={dashboard.data.activity} />
        </>
      )}

      <PromoBanner />
    </Screen>
  );
}

function StatTile({
  icon,
  value,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof Feather>['name'];
  value: string;
  label: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Feather name={icon} size={20} color={colors.primary} />
      <AppText variant="stat">{value}</AppText>
      <AppText variant="caption" color="textMuted" align="center" numberOfLines={1}>
        {label}
      </AppText>
    </>
  );
  if (!onPress) {
    return (
      <View style={styles.statTile} accessible accessibilityLabel={`${value} ${label}`}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${value} ${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.statTile, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

function BookingValueCard({
  summary,
  onPress,
}: {
  summary: DashboardData['bookingValue'];
  onPress?: () => void;
}) {
  const change = summary.changePercent;
  const body = (
    <>
      <View style={styles.valueText}>
        <AppText variant="label" color="heading">
          Confirmed bookings this month
        </AppText>
        <View style={styles.valueRow}>
          <AppText variant="stat">{formatMoney(summary.thisMonth, summary.currencyCode)}</AppText>
          {change !== null ? (
            <StatusPill
              label={`${Math.abs(change)}%`}
              icon={change >= 0 ? 'arrow-up' : 'arrow-down'}
              tone={change >= 0 ? 'success' : 'danger'}
            />
          ) : null}
        </View>
        <AppText variant="caption" color="textMuted">
          Agreed booking value — not payments received.
          {summary.hasOtherCurrencies ? ' Bookings in other currencies are not included.' : ''}
        </AppText>
      </View>
      {summary.series.some((value) => value > 0) ? <Sparkline values={summary.series} width={104} height={52} /> : null}
    </>
  );
  if (!onPress) return <Card style={styles.valueCard}>{body}</Card>;
  return (
    <Card
      style={styles.valueCard}
      onPress={onPress}
      accessibilityLabel="Confirmed bookings this month. Open earnings">
      {body}
    </Card>
  );
}

function ActivityList({ items }: { items: Activity[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <AppText color="textMuted" align="center">
          No activity yet. New inquiries, booking requests and reviews will appear here.
        </AppText>
      </Card>
    );
  }
  return (
    <Card padded={false}>
      {items.map((item, index) => {
        const bookingId = item.bookingId;
        const href =
          item.kind === 'booking' && bookingId
            ? ({ pathname: '/bookings/[bookingId]', params: { bookingId } } as const)
            : item.kind === 'inquiry'
              ? ('/messages' as Href)
              : item.kind === 'review'
                ? ('/profile/reviews' as Href)
                : null;
        const row = (
          <>
            <View style={styles.activityIcon}>
              <Feather name={ACTIVITY_ICON[item.kind]} size={18} color={colors.primaryDark} />
            </View>
            <View style={styles.activityText}>
              <AppText variant="bodyMedium" numberOfLines={1}>
                {item.title}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {formatRelativeTime(item.createdAt)}
              </AppText>
            </View>
            {href ? <Feather name="chevron-right" size={18} color={colors.textMuted} /> : null}
          </>
        );
        const style = [styles.activityRow, index > 0 && styles.activityDivider];
        return href ? (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => router.navigate(href)}
            style={({ pressed }) => [style, pressed && styles.pressed]}>
            {row}
          </Pressable>
        ) : (
          <View key={item.id} style={style} accessible>
            {row}
          </View>
        );
      })}
    </Card>
  );
}

function PromoBanner() {
  return (
    <View style={styles.promo}>
      <Image source={promoImage} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(251,241,229,0.98)', 'rgba(251,241,229,0.9)', 'rgba(251,241,229,0)']}
        locations={[0, 0.5, 0.85]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.promoText}>
        <AppText variant="headline">Grow Your Business with Kiburan</AppText>
        <AppText variant="caption" color="textMuted">
          Get more bookings from couples across Ethiopia
        </AppText>
      </View>
    </View>
  );
}

function DashboardSkeleton() {
  return (
    <View style={styles.skeleton} accessibilityLabel="Loading your overview" accessibilityRole="progressbar">
      <SkeletonCard height={104} />
      <SkeletonCard height={96} />
      <Skeleton width={140} height={16} />
      <SkeletonCard height={180} />
    </View>
  );
}

const styles = StyleSheet.create({
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  businessText: {
    flex: 1,
    gap: spacing.xxs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  shrink: {
    flexShrink: 1,
  },
  greeting: {
    gap: spacing.xxs,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxs,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  valueCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  valueText: {
    flex: 1,
    gap: spacing.xxs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xxs,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 60,
  },
  activityDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.thumb - 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted,
  },
  activityText: {
    flex: 1,
  },
  promo: {
    minHeight: 132,
    borderRadius: radii.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  promoText: {
    width: '58%',
    gap: spacing.xxs,
    padding: spacing.md,
  },
  skeleton: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
});
