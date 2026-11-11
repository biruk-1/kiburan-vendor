import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
import { sizes, spacing } from '@/theme';

export type HeaderBarProps = {
  title: string;
  /** Shown only when there is somewhere to go back to (tab roots have none). */
  showBack?: boolean;
  right?: ReactNode;
};

/** Centered-title header used by detail and form screens (Booking Details, Add Service). */
export function HeaderBar({ title, showBack = router.canGoBack(), right }: HeaderBarProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.side}>
        {showBack ? <IconButton icon="chevron-left" accessibilityLabel="Back" onPress={() => router.back()} /> : null}
      </View>
      <AppText variant="title" align="center" numberOfLines={1} style={styles.title} accessibilityRole="header">
        {title}
      </AppText>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

/** Left-aligned large title used by tab roots (Bookings, Messages). */
export function LargeTitleHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={styles.large}>
      <AppText variant="largeTitle" accessibilityRole="header">
        {title}
      </AppText>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    minHeight: 52,
  },
  side: {
    width: 56,
    flexDirection: 'row',
  },
  right: {
    justifyContent: 'flex-end',
  },
  title: {
    flex: 1,
  },
  large: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.screenPadding,
    paddingTop: spacing.xs,
    minHeight: 52,
  },
});
