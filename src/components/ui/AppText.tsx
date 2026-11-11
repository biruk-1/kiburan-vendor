import { Text, type TextProps } from 'react-native';

import { colors, typography, type ColorToken, type TypographyVariant } from '@/theme';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
};

const MAX_FONT_SCALE = 1.3;

export function AppText({ variant = 'body', color, align, style, ...rest }: AppTextProps) {
  const isHeading = variant === 'largeTitle' || variant === 'greeting' || variant === 'title' || variant === 'brand';
  return (
    <Text
      maxFontSizeMultiplier={variant === 'tab' || variant === 'label' ? 1.2 : MAX_FONT_SCALE}
      style={[
        typography[variant],
        { color: colors[color ?? (isHeading ? 'heading' : 'text')], textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}
