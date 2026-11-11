import { StyleSheet, View } from 'react-native';

import { Sparkline } from '@/components/charts/Sparkline';
import { EmptyState, InlineError } from '@/components/feedback/EmptyState';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { useActiveVendor } from '@/features/account/context/AccountContext';
import { useEarnings } from '@/features/earnings/hooks/useEarnings';
import type { EarningsSummary } from '@/features/earnings/services/earningsService';
import { errorMessage } from '@/lib/query/queryError';
import { colors, spacing } from '@/theme';
import { formatMoney } from '@/utils/format';

export function EarningsScreen() {
  const { vendor } = useActiveVendor();
  const earnings = useEarnings(vendor.vendorId);

  return (
    <Screen
      scroll
      edges={['top']}
      header={<HeaderBar title="Earnings" />}
      refreshing={earnings.isRefetching}
      onRefresh={() => void earnings.refetch()}>
      {earnings.isPending ? (
        <View style={styles.skeleton} accessibilityLabel="Loading earnings" accessibilityRole="progressbar">
          <SkeletonCard height={120} />
          <SkeletonCard height={160} />
          <Skeleton width="70%" height={18} />
        </View>
      ) : earnings.isError ? (
        <InlineError message={errorMessage(earnings.error)} onRetry={() => void earnings.refetch()} />
      ) : (
        <EarningsBody summary={earnings.data} />
      )}
    </Screen>
  );
}

function EarningsBody({ summary }: { summary: EarningsSummary }) {
  const empty =
    summary.pipelineValue === 0 &&
    summary.confirmedValue === 0 &&
    summary.completedValue === 0 &&
    summary.agreedDeposits === 0;

  if (empty) {
    return (
      <EmptyState
        icon="credit-card"
        title="No booking value yet"
        message="Agreed amounts from pending, confirmed, and completed bookings will show here. This is not a payment ledger — payouts are not tracked yet."
      />
    );
  }

  const change = summary.changePercent;

  return (
    <View style={styles.body}>
      <Card style={styles.hero}>
        <AppText variant="label" color="heading">
          Confirmed bookings this month
        </AppText>
        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <AppText variant="stat">{formatMoney(summary.thisMonth, summary.currencyCode)}</AppText>
            {change !== null ? (
              <StatusPill
                label={`${Math.abs(change)}%`}
                icon={change >= 0 ? 'arrow-up' : 'arrow-down'}
                tone={change >= 0 ? 'success' : 'danger'}
              />
            ) : null}
          </View>
          {summary.series.some((value) => value > 0) ? (
            <Sparkline values={summary.series} width={104} height={52} />
          ) : null}
        </View>
        <AppText variant="caption" color="textMuted">
          Agreed booking value — not payments received.
          {summary.hasOtherCurrencies ? ' Bookings in other currencies are not included.' : ''}
        </AppText>
      </Card>

      <Card style={styles.metrics}>
        <Metric
          label="Pipeline value"
          detail={`${summary.pendingBookings} pending`}
          value={formatMoney(summary.pipelineValue, summary.currencyCode)}
        />
        <Metric
          label="Confirmed booking value"
          detail={`${summary.confirmedBookings} confirmed`}
          value={formatMoney(summary.confirmedValue, summary.currencyCode)}
        />
        <Metric
          label="Completed booking value"
          detail={`${summary.fulfilledBookings} fulfilled`}
          value={formatMoney(summary.completedValue, summary.currencyCode)}
        />
        <Metric
          label="Agreed deposits"
          detail="Agreed amounts, not collected"
          value={formatMoney(summary.agreedDeposits, summary.currencyCode)}
          last
        />
      </Card>

      <AppText variant="caption" color="textMuted">
        Kiburan does not show “payments received” or outstanding balances until a vendor payment ledger exists.
        Couple budget payments are not vendor revenue.
      </AppText>
    </View>
  );
}

function Metric({
  label,
  detail,
  value,
  last,
}: {
  label: string;
  detail: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.metric, !last && styles.metricDivider]} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.metricText}>
        <AppText variant="bodyMedium">{label}</AppText>
        <AppText variant="caption" color="textMuted">
          {detail}
        </AppText>
      </View>
      <AppText variant="headline">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    gap: spacing.sm,
  },
  body: {
    gap: spacing.md,
  },
  hero: {
    gap: spacing.xs,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroText: {
    flex: 1,
    gap: spacing.xs,
  },
  metrics: {
    paddingVertical: spacing.xs,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  metricDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  metricText: {
    flex: 1,
    gap: 2,
  },
});
