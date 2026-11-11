import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radii, sizes, spacing } from '@/theme';

export type FilterChipOption<K extends string> = { key: K; label: string; count?: number };

export type FilterChipsProps<K extends string> = {
  options: FilterChipOption<K>[];
  value: K;
  onChange: (key: K) => void;
};

export function FilterChips<K extends string>({ options, value, onChange }: FilterChipsProps<K>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.key === value;
        const text = option.count === undefined ? option.label : `${option.label} (${option.count})`;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={text}
            onPress={() => onChange(option.key)}
            style={[styles.chip, selected ? styles.selected : styles.idle]}>
            <AppText variant="label" color={selected ? 'onPrimary' : 'textMuted'}>
              {text}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
    paddingHorizontal: sizes.screenPadding,
  },
  chip: {
    minHeight: sizes.chipHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  idle: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
});
