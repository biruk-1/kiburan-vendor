import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TibebPattern } from '@/components/brand/TibebPattern';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { VerificationPill } from '@/features/account/components/VerificationPill';
import { useAccount, useActiveVendor } from '@/features/account/context/AccountContext';
import { ROLE_LABEL } from '@/features/account/utils/labels';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useClientCount } from '@/features/bookings/hooks/useBookings';
import { useVendorDetails } from '@/features/business-profile/hooks/useBusinessQueries';
import { useReviewSummary } from '@/features/reviews/hooks/useReviewSummary';
import { colors, radii, shadows, sizes, spacing } from '@/theme';
import { isRemoteImage } from '@/utils/media';

const COVER_HEIGHT = 168;
const AVATAR_SIZE = 96;

type MenuItem = {
  label: string;
  icon: ComponentProps<typeof Feather>['name'];
  onPress?: () => void;
};

export function ProfileScreen() {
  const { vendor, vendors } = useActiveVendor();
  const { clearSelection } = useAccount();
  const { signOut } = useAuth();
  const details = useVendorDetails(vendor.vendorId);
  const reviews = useReviewSummary(vendor.vendorId);
  const clients = useClientCount(vendor.vendorId);

  const coverUrl = details.data?.coverUrl;
  const memberSince = details.data ? String(new Date(details.data.createdAt).getFullYear()) : null;

  const menu: MenuItem[] = [
    { label: 'Business Profile', icon: 'briefcase', onPress: () => router.navigate('/profile/business') },
    { label: 'Portfolio', icon: 'image', onPress: () => router.navigate('/profile/media') },
    { label: 'Availability', icon: 'calendar', onPress: () => router.navigate('/services/availability' as Href) },
    { label: 'Reviews', icon: 'star', onPress: () => router.navigate('/profile/reviews' as Href) },
    { label: 'Business Settings', icon: 'settings', onPress: () => router.navigate('/profile/settings') },
    { label: 'Earnings', icon: 'credit-card', onPress: () => router.navigate('/profile/earnings' as Href) },
    { label: 'Support & Help', icon: 'help-circle' },
    { label: 'About Kiburan Vendor', icon: 'info' },
  ];
  if (vendors.length > 1) {
    menu.unshift({ label: 'Switch business', icon: 'repeat', onPress: () => void clearSelection() });
  }

  return (
    <SafeAreaView edges={[]} style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.cover}>
          {isRemoteImage(coverUrl) ? (
            <Image source={{ uri: coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <TibebPattern height={COVER_HEIGHT} />
          )}
        </View>

        <View style={styles.inner}>
          <View style={styles.identity}>
            <Avatar
              name={vendor.businessName}
              uri={vendor.logoUrl}
              fallback="brand"
              size={AVATAR_SIZE}
              ring
              style={styles.avatar}
            />
            <AppText variant="title" align="center" accessibilityRole="header">
              {vendor.businessName}
            </AppText>
            <View style={styles.pills}>
              <VerificationPill status={vendor.verificationStatus} label="Verified Vendor" />
              <StatusPill label={ROLE_LABEL[vendor.role]} tone="neutral" />
            </View>
          </View>

          <Card padded={false} style={styles.stats}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open reviews"
              onPress={() => router.navigate('/profile/reviews' as Href)}
              style={styles.statPress}>
              <Stat
                value={reviews.data ? (reviews.data.average !== null ? reviews.data.average.toFixed(1) : '—') : null}
                label={reviews.data?.count === 0 ? 'No reviews yet' : 'Rating'}
              />
            </Pressable>
            <View style={styles.statDivider} />
            <Stat value={clients.data !== undefined ? String(clients.data) : null} label="Clients" />
            <View style={styles.statDivider} />
            <Stat value={memberSince} label="Member since" />
          </Card>

          <Card padded={false}>
            {menu.map((item, index) => (
              <MenuRow key={item.label} item={item} first={index === 0} />
            ))}
          </Card>

          <Button label="Sign Out" variant="danger" onPress={() => void signOut()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string | null; label: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={value ? `${label}: ${value}` : `${label}: loading`}>
      {value === null ? <Skeleton width={40} height={22} /> : <AppText variant="stat">{value}</AppText>}
      <AppText variant="caption" color="textMuted" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

function MenuRow({ item, first }: { item: MenuItem; first: boolean }) {
  const enabled = Boolean(item.onPress);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={enabled ? item.label : `${item.label}, coming soon`}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={item.onPress}
      style={({ pressed }) => [styles.menuRow, !first && styles.menuDivider, pressed && styles.pressed]}>
      <Feather name={item.icon} size={20} color={enabled ? colors.heading : colors.textSubtle} />
      <AppText variant="bodyMedium" color={enabled ? 'heading' : 'textSubtle'} style={styles.menuLabel}>
        {item.label}
      </AppText>
      {enabled ? (
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      ) : (
        <StatusPill label="Soon" tone="neutral" style={styles.soon} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  cover: {
    height: COVER_HEIGHT,
    backgroundColor: colors.heading,
  },
  inner: {
    width: '100%',
    maxWidth: sizes.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: sizes.screenPadding,
    gap: spacing.md,
  },
  identity: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: -AVATAR_SIZE / 2,
  },
  avatar: {
    ...shadows.card,
  },
  pills: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
  },
  statPress: {
    flex: 1,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.md,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  menuDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  menuLabel: {
    flex: 1,
  },
  soon: {
    alignSelf: 'center',
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.card,
  },
});
