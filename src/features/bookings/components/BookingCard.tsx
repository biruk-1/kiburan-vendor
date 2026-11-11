import { Feather } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/StatusPill';
import { Thumb } from '@/components/ui/Thumb';
import type { Booking } from '@/features/bookings/services/bookingService';
import { BOOKING_PILL, bookingWhen } from '@/features/bookings/utils/bookingPresentation';
import { displayBookingStatus } from '@/features/bookings/utils/bookingStatus';
import { colors, radii, sizes, spacing } from '@/theme';

export type BookingCardProps = {
  booking: Booking;
  imageUri: string | null;
  onPress: (bookingId: string) => void;
};

export const BookingCard = memo(function BookingCard({ booking, imageUri, onPress }: BookingCardProps) {
  const pill = BOOKING_PILL[displayBookingStatus(booking)];
  const when = bookingWhen(booking);
  const title = booking.couple.coupleLabel ?? booking.title;

  return (
    <Card
      onPress={() => onPress(booking.id)}
      accessibilityLabel={`${title}, ${pill.label}${when ? `, ${when}` : ''}. View details`}
      style={styles.card}>
      <Thumb uri={imageUri} icon="calendar" style={styles.thumb} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant="headline" numberOfLines={2} style={styles.title}>
            {title}
          </AppText>
          <StatusPill label={pill.label} tone={pill.tone} />
        </View>
        <AppText variant="caption" color="textMuted" numberOfLines={1}>
          {booking.packageName ? `${booking.title} · ${booking.packageName}` : booking.title}
        </AppText>
        {when ? (
          <AppText variant="caption" color="textMuted">
            {when}
          </AppText>
        ) : null}
        <View style={styles.details}>
          <AppText variant="label" color="heading">
            View Details
          </AppText>
          <Feather name="chevron-right" size={16} color={colors.heading} />
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  thumb: {
    width: sizes.listThumb,
    height: sizes.listThumb,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  title: {
    flex: 1,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xs,
    minHeight: 32,
    borderRadius: radii.input - 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
});
