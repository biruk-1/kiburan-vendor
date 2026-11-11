import { Feather } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { useAccount } from '@/features/account/context/AccountContext';
import { STANDING_LABEL, ROLE_LABEL } from '@/features/account/utils/labels';
import { vendorStanding } from '@/features/account/utils/accountState';
import { useAuth } from '@/features/auth/context/AuthContext';
import { colors, radii, shadows, spacing } from '@/theme';

export function ChooseBusinessScreen() {
  const { state, selectVendor } = useAccount();
  const { signOut } = useAuth();
  const vendors = state.kind === 'choose_business' ? state.vendors : [];

  return (
    <Screen>
      <AppText variant="largeTitle">Choose a business</AppText>
      <AppText color="textMuted">You manage more than one business. Pick the one to work on now.</AppText>
      <FlatList
        data={vendors}
        keyExtractor={(item) => item.vendorId}
        style={styles.flex}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.businessName}`}
            onPress={() => void selectVendor(item.vendorId)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={styles.rowText}>
              <AppText variant="headline">{item.businessName}</AppText>
              <AppText variant="caption" color="textMuted">
                {ROLE_LABEL[item.role]} · {STANDING_LABEL[vendorStanding(item)]}
              </AppText>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
        )}
      />
      <Button label="Sign Out" variant="danger" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  list: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  rowText: {
    flex: 1,
    gap: spacing.xxs,
  },
  pressed: {
    opacity: 0.85,
  },
});
