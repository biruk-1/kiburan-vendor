import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

import { colors } from '@/theme';

const DEEP_GREEN = '#1F3A2C';
const DEEP_RED = '#7A2E22';

/**
 * Vector stand-in for the woven tibeb band on the Profile cover.
 * Replace with the supplied artwork when the design assets are delivered.
 */
export function TibebPattern({ height }: { height: number }) {
  return (
    <View style={[styles.root, { height }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="tibeb" width="36" height="36" patternUnits="userSpaceOnUse">
            <Rect width="36" height="36" fill={DEEP_GREEN} />
            <Path d="M18 2 L34 18 L18 34 L2 18 Z" fill={DEEP_RED} />
            <Path d="M18 8 L28 18 L18 28 L8 18 Z" fill={colors.primary} />
            <Path d="M18 13 L23 18 L18 23 L13 18 Z" fill={DEEP_GREEN} />
            <Path d="M0 0 L4 0 L0 4 Z M36 0 L32 0 L36 4 Z M0 36 L4 36 L0 32 Z M36 36 L32 36 L36 32 Z" fill={colors.primaryLight} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#tibeb)" />
        <Rect width="100%" height="100%" fill="#000000" opacity={0.18} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    overflow: 'hidden',
  },
});
