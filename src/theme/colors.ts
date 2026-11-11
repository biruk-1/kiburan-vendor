/** Sampled from the vendor design board — see docs/design/01-figma-analysis-and-screen-plan.md §2. */
export const colors = {
  background: '#FBF1E5',
  backgroundAlt: '#FBEEDF',
  surface: '#FFFBF5',
  surfaceMuted: '#F5ECE0',
  border: '#EFE3D3',
  divider: '#F2E8DC',

  primary: '#CF954B',
  primaryLight: '#DBA359',
  primaryDark: '#B9812F',
  primaryMuted: '#F3E2C6',
  onPrimary: '#FFFFFF',

  heading: '#1E1712',
  text: '#2B241E',
  textMuted: '#6E655C',
  textSubtle: '#9A9189',
  textOnDark: '#FFFFFF',

  success: '#2F6B4A',
  successMuted: '#DDEFE3',
  warning: '#B07433',
  warningMuted: '#FBE6C8',
  info: '#4A6F9A',
  infoMuted: '#E1ECF7',
  danger: '#D9573A',
  dangerMuted: '#FBE5DE',

  shadow: '#8A6A3F',
  overlay: 'rgba(20, 14, 8, 0.45)',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;

/** Top → bottom stops of the gold primary button. */
export const primaryGradient = [colors.primaryLight, colors.primary] as const;
