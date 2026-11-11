import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState, InlineError } from '@/components/feedback/EmptyState';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Screen } from '@/components/layout/Screen';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { useActiveVendor } from '@/features/account/context/AccountContext';
import { canManageBusiness } from '@/features/account/utils/accountState';
import { useInquiry, useUpdateInquiryStatus } from '@/features/inquiries/hooks/useInquiries';
import type { InquiryDetail } from '@/features/inquiries/services/inquiryService';
import { INQUIRY_PILL } from '@/features/inquiries/utils/inquiryStatus';
import { errorMessage } from '@/lib/query/queryError';
import { colors, spacing } from '@/theme';
import { formatDay, formatMoney, formatRelativeTime, parseDateOnly } from '@/utils/format';

export function InquiryDetailScreen({ inquiryId }: { inquiryId: string }) {
  const { vendor } = useActiveVendor();
  const query = useInquiry(vendor.vendorId, inquiryId);
  const updateStatus = useUpdateInquiryStatus(vendor.vendorId, inquiryId);
  const canManage = canManageBusiness(vendor.role);
  const [sheet, setSheet] = useState<'status' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  return (
    <Screen
      scroll
      edges={['top']}
      header={<HeaderBar title="Inquiry" />}
      refreshing={query.isRefetching}
      onRefresh={() => void query.refetch()}>
      {query.isPending ? (
        <View style={styles.skeleton}>
          <SkeletonCard height={180} />
          <Skeleton width="50%" height={18} />
          <SkeletonCard height={120} />
        </View>
      ) : query.isError ? (
        <InlineError message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : !query.data ? (
        <EmptyState icon="message-square" title="Inquiry not found" message="It may belong to another business." />
      ) : (
        <InquiryDetailBody
          inquiry={query.data}
          canManage={canManage}
          canQuote={canManage}
          actionError={actionError}
          onStatus={() => setSheet('status')}
          onQuote={() => router.push(`/messages/${inquiryId}/quote` as Href)}
        />
      )}

      <ActionSheet
        visible={sheet === 'status'}
        title="Update inquiry"
        message="Mark how you responded. Sending a quote also moves the inquiry to Quoted."
        onClose={() => setSheet(null)}
        actions={[
          {
            label: 'Mark as replied',
            icon: 'message-circle',
            onPress: () => {
              setActionError(null);
              void updateStatus.mutateAsync('replied').catch((error) => setActionError(errorMessage(error)));
            },
          },
          {
            label: 'Decline inquiry',
            icon: 'x-circle',
            destructive: true,
            onPress: () => {
              setActionError(null);
              void updateStatus.mutateAsync('declined').catch((error) => setActionError(errorMessage(error)));
            },
          },
          {
            label: 'Close inquiry',
            icon: 'archive',
            onPress: () => {
              setActionError(null);
              void updateStatus.mutateAsync('closed').catch((error) => setActionError(errorMessage(error)));
            },
          },
        ]}
      />
    </Screen>
  );
}

function InquiryDetailBody({
  inquiry,
  canManage,
  canQuote,
  actionError,
  onStatus,
  onQuote,
}: {
  inquiry: InquiryDetail;
  canManage: boolean;
  canQuote: boolean;
  actionError: string | null;
  onStatus: () => void;
  onQuote: () => void;
}) {
  const pill = INQUIRY_PILL[inquiry.status];
  const weddingDay = inquiry.couple.weddingDate ? parseDateOnly(inquiry.couple.weddingDate) : null;

  return (
    <>
      <Card style={styles.card}>
        <View style={styles.row}>
          <AppText variant="title" style={styles.flex}>
            {inquiry.couple.coupleLabel ?? 'Couple inquiry'}
          </AppText>
          <StatusPill label={pill.label} tone={pill.tone} size="md" />
        </View>
        <AppText color="textMuted">{formatRelativeTime(inquiry.createdAt)}</AppText>
        {inquiry.serviceTitle ? <AppText variant="headline">{inquiry.serviceTitle}</AppText> : null}
        {inquiry.message ? <AppText color="textMuted">{inquiry.message}</AppText> : null}
        {inquiry.proposedBudget != null ? (
          <AppText variant="bodyMedium">Proposed budget {formatMoney(inquiry.proposedBudget)}</AppText>
        ) : null}
      </Card>

      <Card style={styles.card}>
        <AppText variant="headline">Wedding</AppText>
        {inquiry.couple.weddingTitle ? <AppText>{inquiry.couple.weddingTitle}</AppText> : null}
        {weddingDay ? <AppText color="textMuted">Date {formatDay(weddingDay)}</AppText> : null}
        {inquiry.couple.city ? <AppText color="textMuted">{inquiry.couple.city}</AppText> : null}
        {inquiry.eventName ? (
          <AppText color="textMuted">
            Event {inquiry.eventName}
            {inquiry.eventVenueName ? ` · ${inquiry.eventVenueName}` : ''}
          </AppText>
        ) : null}
        {inquiry.couple.contactPhone ? (
          <AppText variant="bodyMedium">Phone {inquiry.couple.contactPhone}</AppText>
        ) : (
          <AppText variant="caption" color="textMuted">
            Contact details appear after a booking with this couple is confirmed.
          </AppText>
        )}
      </Card>

      <Card style={styles.card}>
        <AppText variant="headline">Quotes</AppText>
        {inquiry.quotes.length === 0 ? (
          <AppText color="textMuted">No quotes sent yet.</AppText>
        ) : (
          inquiry.quotes.map((quote) => (
            <View key={quote.id} style={styles.quote}>
              <AppText variant="bodyMedium">
                {formatMoney(quote.amount, quote.currencyCode)}
                {quote.packageName ? ` · ${quote.packageName}` : ''}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {quote.status}
                {quote.validUntil ? ` · valid until ${quote.validUntil}` : ''}
              </AppText>
              {quote.description ? <AppText color="textMuted">{quote.description}</AppText> : null}
            </View>
          ))
        )}
      </Card>

      {actionError ? (
        <AppText color="danger" accessibilityRole="alert">
          {actionError}
        </AppText>
      ) : null}

      {canQuote && !['declined', 'closed'].includes(inquiry.status) ? (
        <Button label="Send quote" onPress={onQuote} />
      ) : null}
      {canManage && inquiry.status === 'new' ? (
        <Button label="Update status" variant="outline" onPress={onStatus} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    gap: spacing.md,
  },
  card: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  quote: {
    gap: 2,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
});
