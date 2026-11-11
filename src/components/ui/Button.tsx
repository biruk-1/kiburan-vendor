import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, primaryGradient, radii, sizes, spacing } from '@/theme';

export type ButtonVariant = 'primary' | 'outline' | 'danger' | 'text';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ComponentProps<typeof Feather>['name'];
  loading?: boolean;
  disabled?: boolean;
  /** Taller button used on the Welcome screen. */
  hero?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

const LABEL_COLOR = {
  primary: 'onPrimary',
  outline: 'primaryDark',
  danger: 'danger',
  text: 'primaryDark',
} as const;

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  hero = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const inactive = disabled || loading;
  const labelColor = LABEL_COLOR[variant];

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={colors[labelColor]} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={18} color={colors[labelColor]} /> : null}
          <AppText variant={variant === 'text' ? 'bodyMedium' : 'button'} color={labelColor}>
            {label}
          </AppText>
        </>
      )}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant !== 'text' && { minHeight: hero ? sizes.heroButtonHeight : sizes.buttonHeight },
        variant === 'outline' && styles.outline,
        variant === 'danger' && styles.danger,
        pressed && styles.pressed,
        inactive && styles.inactive,
        style,
      ]}>
      {variant === 'primary' ? (
        <LinearGradient colors={primaryGradient} style={[styles.fill, { minHeight: hero ? sizes.heroButtonHeight : sizes.buttonHeight }]}>
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  danger: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  inactive: {
    opacity: 0.55,
  },
});
