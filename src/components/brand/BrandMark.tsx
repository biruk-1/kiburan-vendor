import { View, type ViewProps } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';

export type BrandMarkProps = ViewProps & {
  size?: number;
  color?: string;
  /** The design shows the mark without the outer ring on the Welcome hero. */
  ring?: boolean;
};

/**
 * Approximation of the gold interlaced Kiburan monogram (same drawing as the client app).
 * Replace with the official SVG when the brand asset is supplied.
 */
export function BrandMark({ size = 56, color = colors.primary, ring = true, style, ...rest }: BrandMarkProps) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Kiburan"
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}
      {...rest}>
      <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        {ring ? <Circle cx="32" cy="32" r="30" stroke={color} strokeWidth="1.5" opacity={0.55} /> : null}
        <Path d="M22 18c0 10 6 14 10 18-4 4-10 8-10 18" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
        <Path d="M42 18c0 10-6 14-10 18 4 4 10 8 10 18" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
        <Path d="M26 32h12" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.85} />
      </Svg>
    </View>
  );
}
