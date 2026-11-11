import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
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
import { Thumb } from '@/components/ui/Thumb';
import { useActiveVendor } from '@/features/account/context/AccountContext';
import { canManageBusiness } from '@/features/account/utils/accountState';
import { useBooking, useRespondToBooking } from '@/features/bookings/hooks/useBookings';
import type { Booking } from '@/features/bookings/services/bookingService';
import { BOOKING_PILL, bookingTimeRange } from '@/features/bookings/utils/bookingPresentation';
import { displayBookingStatus } from '@/features/bookings/utils/bookingStatus';
import { useVendorImages } from '@/features/business-profile/hooks/useBusinessQueries';
import { errorMessage } from '@/lib/query/queryError';
import { colors, radii, spacing } from '@/theme';
import { formatDay, formatMoney, parseDateOnly } from '@/utils/format';

export function BookingDetailScreen({ bookingId }: { bookingId: string }) {
  const { vendor } = useActiveVendor();
  const query = useBooking(vendor.vendorId, bookingId);
  const images = useVendorImages(vendor.vendorId);
  const respond = useRespondToBooking(vendor.vendorId, bookingId);
  const canManage = canManageBusiness(vendor.role);
  const [confirm, setConfirm] = useState<'confirm' | 'decline' | 'fulfil' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const run = async (action: 'confirm' | 'decline' | 'fulfil') => {
    setActionError(null);
    try {
      await respond.mutateAsync({ action });
    } catch (error) {
      setActionError(errorMessage(error));
    }
  };

  return (
    <Screen
      scroll
      edges={['top']}
      header={<HeaderBar title="Booking Details" />}
      refreshing={query.isRefetching}
      onRefresh={() => void query.refetch()}>
      {query.isPending ? (
        <View style={styles.skeleton} accessibilityLabel="Loading booking" accessibilityRole="progressbar">
          <SkeletonCard height={200} />
          <Skeleton width="60%" height={20} />
          <SkeletonCard height={160} />
        </View>
      ) : query.isError ? (
        <InlineError message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : !query.data ? (
        <EmptyState
          icon="calendar"
          title="Booking not found"
          message="It may have been removed, or it belongs to a different business."
        />
      ) : (
        <>
          <BookingDetail
            booking={query.data}
            imageUri={
              (query.data.serviceId ? images.data?.byService[query.data.serviceId] : undefined) ??
              images.data?.first ??
              null
            }
          />
          {actionError ? (
            <AppText color="danger" accessibilityRole="alert">
              {actionError}
            </AppText>
          ) : null}
          {canManage && query.data.status === 'pending' ? (
            <View style={styles.actions}>
              <Button label="Confirm booking" loading={respond.isPending} onPress={() => setConfirm('confirm')} />
              <Button
                label="Decline"
                variant="outline"
                loading={respond.isPending}
                onPress={() => setConfirm('decline')}
              />
            </View>
          ) : null}
          {canManage && query.data.status === 'confirmed' ? (
            <Button
              label="Mark fulfilled"
              loading={respond.isPending}
              onPress={() => setConfirm('fulfil')}
            />
          ) : null}
        </>
      )}

      <ActionSheet
        visible={confirm === 'confirm'}
        title="Confirm booking?"
        message="The couple will stay booked with you. If times are set, an availability block is added."
        onClose={() => setConfirm(null)}
        actions={[{ label: 'Confirm', icon: 'check-circle', onPress: () => void run('confirm') }]}
      />
      <ActionSheet
        visible={confirm === 'decline'}
        title="Decline booking?"
        message="This cancels the booking request."
        onClose={() => setConfirm(null)}
        actions={[{ label: 'Decline', icon: 'x-circle', destructive: true, onPress: () => void run('decline') }]}
      />
      <ActionSheet
        visible={confirm === 'fulfil'}
        title="Mark as fulfilled?"
        message="Use this after the event is complete."
        onClose={() => setConfirm(null)}
        actions={[{ label: 'Mark fulfilled', icon: 'check', onPress: () => void run('fulfil') }]}
      />
    </Screen>
  );
}

function BookingDetail({ booking, imageUri }: { booking: Booking; imageUri: string | null }) {
  const pill = BOOKING_PILL[displayBookingStatus(booking)];
  const day = booking.bookingDate ? parseDateOnly(booking.bookingDate) : booking.startAt ? new Date(booking.startAt) : null;
  const time = bookingTimeRange(booking);
  const weddingDay = booking.couple.weddingDate ? parseDateOnly(booking.couple.weddingDate) : null;

  return (
    <Card padded={false} style={styles.card}>
      <View>
        <Thumb uri={imageUri} icon="calendar" radius={0} style={styles.hero} />
        <StatusPill label={pill.label} tone={pill.tone} size="md" style={styles.heroPill} />
      </View>

      <View style={styles.section}>
        <AppText variant="title" accessibilityRole="header">
          {booking.couple.coupleLabel ?? booking.title}
        </AppText>
        <AppText color="textMuted">{booking.title}</AppText>
        {booking.packageName ? <AppText color="textMuted">{booking.packageName}</AppText> : null}
      </View>

      <View style={[styles.section, styles.divider]}>
        <InfoRow icon="calendar" label="Date" value={day ? formatDay(day) : 'Not set'} />
        {time ? <InfoRow icon="clock" label="Time" value={time} /> : null}
        {booking.couple.city ? <InfoRow icon="map-pin" label="City" value={booking.couple.city} /> : null}
        {weddingDay ? <InfoRow icon="heart" label="Wedding date" value={formatDay(weddingDay)} /> : null}
      </View>

      <View style={[styles.notice, styles.divider]}>
        <Feather name="info" size={16} color={colors.textMuted} />
        <AppText variant="caption" color="textMuted" style={styles.flex}>
          {booking.couple.contactPhone
            ? `Contact: ${booking.couple.contactPhone}`
            : 'Contact details appear after this booking is confirmed.'}
        </AppText>
      </View>

      {booking.serviceDescription || booking.notes ? (
        <View style={[styles.section, styles.divider]}>
          <AppText variant="headline">Service Details</AppText>
          {booking.serviceDescription ? <AppText color="textMuted">{booking.serviceDescription}</AppText> : null}
          {booking.notes ? (
            <AppText color="textMuted">
              <AppText variant="label" color="heading">
                Notes:{' '}
              </AppText>
              {booking.notes}
            </AppText>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.section, styles.divider]}>
        <AmountRow
          label="Total Amount"
          value={booking.totalAmount !== null ? formatMoney(booking.totalAmount, booking.currencyCode) : 'Not set'}
          strong
        />
        {booking.depositAmount !== null ? (
          <AmountRow label="Deposit" value={formatMoney(booking.depositAmount, booking.currencyCode)} />
        ) : null}
      </View>
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: ComponentProps<typeof Feather>['name']; label: string; value: string }) {
  return (
    <View style={styles.infoRow} accessible accessibilityLabel={`${label}: ${value}`}>
      <Feather name={icon} size={20} color={colors.heading} />
      <View>
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
        <AppText variant="bodyMedium">{value}</AppText>
      </View>
    </View>
  );
}

function AmountRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.amountRow} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant={strong ? 'headline' : 'body'} color={strong ? 'heading' : 'textMuted'}>
        {label}
      </AppText>
      <AppText variant="headline">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    gap: spacing.md,
  },
  card: {
    overflow: 'hidden',
  },
  hero: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
  },
  heroPill: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
  },
  section: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundAlt,
  },
  flex: {
    flex: 1,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
});
