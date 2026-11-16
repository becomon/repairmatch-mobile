// Design tokens shared by every screen. Values come from the design-mobile mockups.

export const colors = {
  primary: '#2448c8',
  primaryDark: '#1b379c',
  primarySoft: '#e6ecfb',
  accent: '#e8590c',
  accentDark: '#a33d06',
  accentSoft: '#fff1e8',
  background: '#f4f6fa',
  surface: '#ffffff',
  border: '#dde2ec',
  text: '#172033',
  textSoft: '#3d4657',
  textMuted: '#5a6478',
  success: '#1f7a4d',
  successSoft: '#e3f4ea',
  warning: '#8a5300',
  warningSoft: '#fdf0d5',
  danger: '#b42318',
  dangerSoft: '#fdeceb',
  neutralSoft: '#eef1f6',
  teal: '#0f766e',
  overlay: 'rgba(23,32,51,0.45)',
} as const;

// 8pt scale with a 4 step for tight gaps.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Horizontal screen gutter. */
export const GUTTER = 20;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

/** Minimum touch target in points. */
export const TOUCH = 48;

export const fonts = {
  heading: 'Manrope_700Bold',
  headingXL: 'Manrope_800ExtraBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

// Type scale: 28 / 22 / 17 / 15 / 13 (+ 12 for chips and tab labels).
export const typography = {
  display: { fontFamily: fonts.headingXL, fontSize: 28, lineHeight: 34 },
  title: { fontFamily: fonts.headingXL, fontSize: 22, lineHeight: 28 },
  heading: { fontFamily: fonts.heading, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.bodySemi, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  smallStrong: { fontFamily: fonts.bodySemi, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.bodyBold, fontSize: 12, lineHeight: 16 },
} as const;

export type TypographyVariant = keyof typeof typography;

export const shadow = {
  card: {
    shadowColor: '#172033',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sheet: {
    shadowColor: '#172033',
    shadowOpacity: 0.14,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
} as const;
