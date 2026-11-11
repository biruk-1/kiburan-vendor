import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { colors, radii, spacing } from '@/theme';

export type EmptyStateProps = {
  icon: ComponentProps<typeof Feather>['name'];
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.root}>
      <View style={styles.icon}>
        <Feather name={icon} size={26} color={colors.primaryDark} />
      </View>
      <AppText variant="title" align="center">
        {title}
      </AppText>
      {message ? (
        <AppText color="textMuted" align="center">
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} style={styles.action} /> : null}
    </View>
  );
}

/** Inline error with retry, used inside screens that keep their header. */
export function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.root} accessibilityRole="alert">
      <View style={[styles.icon, styles.errorIcon]}>
        <Feather name="alert-circle" size={26} color={colors.danger} />
      </View>
      <AppText variant="title" align="center">
        Couldn&apos;t load this
      </AppText>
      <AppText color="textMuted" align="center">
        {message}
      </AppText>
      <Button label="Try again" variant="outline" icon="refresh-cw" onPress={onRetry} style={styles.action} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted,
  },
  errorIcon: {
    backgroundColor: colors.dangerMuted,
  },
  action: {
    alignSelf: 'stretch',
    marginTop: spacing.xs,
  },
});
