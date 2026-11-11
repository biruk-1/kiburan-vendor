import type { ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  input: 12,
  thumb: 12,
  card: 16,
  pill: 999,
} as const;

export const sizes = {
  screenPadding: spacing.lg,
  buttonHeight: 52,
  heroButtonHeight: 56,
  inputHeight: 48,
  chipHeight: 32,
  tabBarHeight: 64,
  listThumb: 76,
  hitSlop: 44,
  /** Content is centred at this width on tablets and web. */
  maxContentWidth: 720,
} as const;

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const satisfies Record<string, ViewStyle>;
