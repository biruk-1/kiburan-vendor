import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand/BrandMark';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/theme';

/** Full-screen state used while the app works out where the user belongs. */
export function LoadingView({ message }: { message?: string }) {
  return (
    <View style={styles.root} accessibilityLabel={message ?? 'Loading'} accessibilityRole="progressbar">
      <BrandMark size={64} />
      <ActivityIndicator color={colors.primary} />
      {message ? (
        <AppText variant="caption" color="textMuted" align="center">
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

export function ErrorView({
  title = 'Something went wrong',
  message,
  onRetry,
  secondaryLabel,
  onSecondary,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <View style={styles.root} accessibilityRole="alert">
      <BrandMark size={56} color={colors.textSubtle} />
      <AppText variant="title" align="center">
        {title}
      </AppText>
      <AppText color="textMuted" align="center">
        {message}
      </AppText>
      <View style={styles.actions}>
        {onRetry ? <Button label="Try again" onPress={onRetry} /> : null}
        {secondaryLabel && onSecondary ? <Button label={secondaryLabel} variant="text" onPress={onSecondary} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
    backgroundColor: colors.background,
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
