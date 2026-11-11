import type { TextStyle } from 'react-native';

/** Loaded in src/app/_layout.tsx via @expo-google-fonts. */
export const fontFamilies = {
  brand: 'CormorantGaramond_700Bold',
  brandSemiBold: 'CormorantGaramond_600SemiBold',
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semiBold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
} as const;

type TextVariant = Required<Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight'>> &
  Pick<TextStyle, 'letterSpacing'>;

export const typography = {
  brand: { fontFamily: fontFamilies.brand, fontSize: 40, lineHeight: 44, letterSpacing: 0.4 },
  brandSub: { fontFamily: fontFamilies.brandSemiBold, fontSize: 28, lineHeight: 32 },
  largeTitle: { fontFamily: fontFamilies.bold, fontSize: 28, lineHeight: 34 },
  greeting: { fontFamily: fontFamilies.bold, fontSize: 24, lineHeight: 30 },
  title: { fontFamily: fontFamilies.bold, fontSize: 18, lineHeight: 24 },
  headline: { fontFamily: fontFamilies.bold, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: fontFamilies.regular, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fontFamilies.medium, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fontFamilies.semiBold, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 16 },
  stat: { fontFamily: fontFamilies.bold, fontSize: 22, lineHeight: 26 },
  tab: { fontFamily: fontFamilies.medium, fontSize: 11, lineHeight: 14 },
  button: { fontFamily: fontFamilies.bold, fontSize: 16, lineHeight: 20 },
} as const satisfies Record<string, TextVariant>;

export type TypographyVariant = keyof typeof typography;
