import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { Thumb } from '@/components/ui/Thumb';
import type { VendorService } from '@/features/services/services/serviceCatalog';
import { formatServicePrice } from '@/features/services/utils/servicePrice';
import { colors, radii, spacing } from '@/theme';

export type ServiceGridCardProps = {
  service: VendorService;
  imageUri: string | null;
  /** Absent for team members who can't manage services. */
  onPress?: (service: VendorService) => void;
  onMenu?: (service: VendorService) => void;
};

/** The ⋮ button sits beside (not inside) the pressable areas: nested buttons are invalid on web. */
export const ServiceGridCard = memo(function ServiceGridCard({ service, imageUri, onPress, onMenu }: ServiceGridCardProps) {
  const price = formatServicePrice(service);
  const status = service.isActive ? 'Active' : 'Inactive';
  const press = onPress ? () => onPress(service) : undefined;

  return (
    <Card padded={false} style={styles.card}>
      <Pressable accessible={false} disabled={!press} onPress={press} style={({ pressed }) => pressed && styles.pressed}>
        <Thumb uri={imageUri} icon="briefcase" radius={0} style={styles.image} />
      </Pressable>
      <View style={styles.body}>
        <Pressable
          accessibilityRole={press ? 'button' : undefined}
          accessibilityLabel={`${service.title}, ${price}, ${status}${press ? '. Edit' : ''}`}
          disabled={!press}
          onPress={press}
          style={({ pressed }) => [styles.text, pressed && styles.pressed]}>
          <AppText variant="headline" numberOfLines={2}>
            {service.title}
          </AppText>
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {price}
          </AppText>
          <StatusPill label={status} tone={service.isActive ? 'success' : 'neutral'} style={styles.pill} />
        </Pressable>
        {onMenu ? (
          <IconButton
            icon="more-vertical"
            size={18}
            color={colors.textMuted}
            accessibilityLabel={`More actions for ${service.title}`}
            onPress={() => onMenu(service)}
            style={styles.menu}
          />
        ) : null}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 1.25,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  text: {
    flex: 1,
    gap: 2,
    paddingLeft: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  menu: {
    width: 32,
    height: 36,
    marginTop: spacing.xxs,
  },
  pill: {
    marginTop: spacing.xxs,
  },
  pressed: {
    opacity: 0.85,
  },
});
