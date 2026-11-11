import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, sizes } from '@/theme';

export type IconButtonProps = {
  icon: ComponentProps<typeof Feather>['name'];
  accessibilityLabel: string;
  onPress: () => void;
  /** `filled` is the gold square "+" on My Services. */
  variant?: 'plain' | 'filled';
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = 'plain',
  color,
  size = 22,
  style,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.base, variant === 'filled' && styles.filled, pressed && styles.pressed, style]}>
      <Feather name={icon} size={size} color={color ?? (variant === 'filled' ? colors.onPrimary : colors.heading)} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: sizes.hitSlop,
    height: sizes.hitSlop,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  filled: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});
