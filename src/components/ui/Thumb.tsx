import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ComponentProps } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii } from '@/theme';
import { isRemoteImage } from '@/utils/media';

export type ThumbProps = {
  uri: string | null | undefined;
  /** Shown on the gold tile when there is no photo. */
  icon?: ComponentProps<typeof Feather>['name'];
  style?: StyleProp<ViewStyle>;
  radius?: number;
};

/** Business photo with a neutral placeholder — never a stock image pretending to be the vendor's work. */
export function Thumb({ uri, icon = 'image', style, radius = radii.thumb }: ThumbProps) {
  return (
    <View style={[styles.frame, { borderRadius: radius }, style]}>
      {isRemoteImage(uri) ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" transition={150} />
      ) : (
        <Feather name={icon} size={24} color={colors.primaryDark} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted,
  },
});
