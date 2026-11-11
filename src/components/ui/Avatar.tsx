import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BrandMark } from '@/components/brand/BrandMark';
import { AppText } from '@/components/ui/AppText';
import { colors, radii } from '@/theme';
import { initials } from '@/utils/format';
import { isRemoteImage } from '@/utils/media';

export type AvatarProps = {
  name: string;
  uri?: string | null;
  size?: number;
  /** Business avatars fall back to the Kiburan mark instead of initials. */
  fallback?: 'initials' | 'brand';
  ring?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({ name, uri, size = 44, fallback = 'initials', ring = false, style }: AvatarProps) {
  const frame = [
    styles.frame,
    { width: size, height: size, borderRadius: size / 2 },
    ring && { borderWidth: Math.max(2, size / 24), borderColor: colors.primary },
    style,
  ];

  if (isRemoteImage(uri)) {
    return (
      <View style={frame}>
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          accessibilityLabel={name}
        />
      </View>
    );
  }

  return (
    <View style={[frame, fallback === 'brand' ? styles.brand : styles.initials]} accessibilityLabel={name}>
      {fallback === 'brand' ? (
        <BrandMark size={size * 0.62} ring={false} />
      ) : (
        <AppText variant={size >= 56 ? 'title' : 'label'} color="onPrimary">
          {initials(name)}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  brand: {
    backgroundColor: colors.heading,
  },
  initials: {
    backgroundColor: colors.primary,
  },
});
