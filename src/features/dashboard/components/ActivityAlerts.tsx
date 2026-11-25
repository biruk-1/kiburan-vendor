import { Feather } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import type { VendorStanding } from '@/features/account/types';
import { colors, radii, spacing } from '@/theme';

type AlertItem = {
  key: string;
  title: string;
  detail: string;
  href: Href;
  icon: 'clock' | 'message-square' | 'calendar' | 'alert-circle';
};

export function ActivityAlerts({
  standing,
  newInquiries,
  pendingBookings,
}: {
  standing: VendorStanding;
  newInquiries: number;
  pendingBookings: number;
}) {
  const alerts: AlertItem[] = [];

  if (standing === 'pending_review') {
    alerts.push({
      key: 'verification',
      title: 'Pending verification',
      detail: 'Waiting for Kiburan admin approval. Couples cannot see your listing yet.',
      href: '/profile/business' as Href,
      icon: 'clock',
    });
  } else if (standing === 'rejected') {
    alerts.push({
      key: 'rejected',
      title: 'Verification rejected',
      detail: 'Update your business details and submit again for review.',
      href: '/profile/business' as Href,
      icon: 'alert-circle',
    });
  } else if (standing === 'suspended') {
    alerts.push({
      key: 'suspended',
      title: 'Listing suspended',
      detail: 'Your marketplace listing is suspended. Contact support if this looks wrong.',
      href: '/profile/business' as Href,
      icon: 'alert-circle',
    });
  }

  if (newInquiries > 0) {
    alerts.push({
      key: 'inquiries',
      title: `${newInquiries} new inquir${newInquiries === 1 ? 'y' : 'ies'}`,
      detail: 'Couples are waiting for your reply or quote.',
      href: '/messages' as Href,
      icon: 'message-square',
    });
  }

  if (pendingBookings > 0) {
    alerts.push({
      key: 'bookings',
      title: `${pendingBookings} pending booking${pendingBookings === 1 ? '' : 's'}`,
      detail: 'Confirm or decline booking requests.',
      href: '/bookings' as Href,
      icon: 'calendar',
    });
  }

  if (alerts.length === 0) return null;

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <AppText variant="headline">Needs attention</AppText>
      {alerts.map((alert) => (
        <Pressable
          key={alert.key}
          onPress={() => router.navigate(alert.href)}
          accessibilityRole="button"
          accessibilityLabel={`${alert.title}. ${alert.detail}`}>
          <Card style={styles.card}>
            <View style={styles.iconWrap}>
              <Feather name={alert.icon} size={18} color={colors.danger} />
            </View>
            <View style={styles.text}>
              <AppText variant="headline">{alert.title}</AppText>
              <AppText color="textMuted">{alert.detail}</AppText>
            </View>
            <Feather name="chevron-right" size={18} color={colors.danger} />
          </Card>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.danger,
    backgroundColor: colors.dangerMuted,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
});
