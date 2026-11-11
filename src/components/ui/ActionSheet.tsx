import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { colors, radii, sizes, spacing } from '@/theme';

export type SheetAction = {
  label: string;
  icon: ComponentProps<typeof Feather>['name'];
  destructive?: boolean;
  onPress: () => void;
};

export type ActionSheetProps = {
  visible: boolean;
  title: string;
  message?: string;
  actions: SheetAction[];
  onClose: () => void;
};

/** Bottom-sheet menu and confirmation. Used instead of Alert because Alert buttons do nothing on web. */
export function ActionSheet({ visible, title, message, actions, onClose }: ActionSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.header}>
          <AppText variant="title">{title}</AppText>
          {message ? <AppText color="textMuted">{message}</AppText> : null}
        </View>
        {actions.map((action) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            onPress={() => {
              onClose();
              action.onPress();
            }}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <Feather name={action.icon} size={20} color={action.destructive ? colors.danger : colors.heading} />
            <AppText variant="bodyMedium" color={action.destructive ? 'danger' : 'heading'}>
              {action.label}
            </AppText>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={({ pressed }) => [styles.row, styles.cancel, pressed && styles.pressed]}>
          <AppText variant="bodyMedium" color="textMuted">
            Cancel
          </AppText>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  sheet: {
    width: '100%',
    maxWidth: sizes.maxContentWidth,
    alignSelf: 'center',
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.card + 4,
    borderTopRightRadius: radii.card + 4,
    paddingBottom: spacing.xs,
  },
  header: {
    gap: spacing.xxs,
    paddingHorizontal: sizes.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: sizes.screenPadding,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  cancel: {
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
});
