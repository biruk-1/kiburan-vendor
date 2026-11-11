import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radii, spacing, type ColorToken } from '@/theme';

export type PillTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

const TONES: Record<PillTone, { fg: ColorToken; bg: ColorToken }> = {
  success: { fg: 'success', bg: 'successMuted' },
  warning: { fg: 'warning', bg: 'warningMuted' },
  info: { fg: 'info', bg: 'infoMuted' },
  danger: { fg: 'danger', bg: 'dangerMuted' },
  neutral: { fg: 'textMuted', bg: 'surfaceMuted' },
};

export type StatusPillProps = {
  label: string;
  tone: PillTone;
  icon?: ComponentProps<typeof Feather>['name'];
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

export function StatusPill({ label, tone, icon, size = 'sm', style }: StatusPillProps) {
  const { fg, bg } = TONES[tone];
  return (
    <View
      accessibilityLabel={label}
      style={[styles.pill, size === 'md' && styles.md, { backgroundColor: colors[bg] }, style]}>
      {icon ? <Feather name={icon} size={size === 'md' ? 14 : 11} color={colors[fg]} /> : null}
      <AppText variant={size === 'md' ? 'label' : 'caption'} color={fg} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  md: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
  },
  text: {
    fontFamily: 'DMSans_600SemiBold',
  },
});
