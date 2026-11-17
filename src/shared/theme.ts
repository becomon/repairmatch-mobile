// Design tokens shared by every screen. Same warm palette as the web app (repairmatch-frontend styles.css).

export const colors = {
  // Brand terracotta: primary actions, active tab, focus.
  primary: '#c94a14',
  primaryDark: '#a83a0b',
  primarySoft: '#fdeee6',
  onPrimary: '#ffffff',
  // Warm stone ground, white surfaces.
  background: '#eae6df',
  surface: '#ffffff',
  surface2: '#f3f0ea',
  border: '#d5cec0',
  navLine: '#e2ddd3',
  text: '#1f1a16',
  textSoft: '#4a4038',
  textMuted: '#6a5f56',
  // Fresh emerald: verified, "ofertas listas", positives.
  fresh: '#059669',
  freshSoft: '#ecfdf5',
  freshStrong: '#047857',
  // Cobalt only for links and avatar initials, never decoration.
  cobalt: '#2563eb',
  cobaltSoft: '#eff6ff',
  link: '#2448c8',
  sun: '#e7a52a',
  slate: '#334155',
  success: '#2c7a4b',
  successSoft: '#e3f2e8',
  warning: '#8a5a00',
  warningSoft: '#f8ecd2',
  danger: '#b3261e',
  dangerSoft: '#f9e2df',
  info: '#2448c8',
  infoSoft: '#e4e9fa',
  neutralSoft: '#f3f0ea',
  coverLine: '#c2cec7',
  overlay: 'rgba(31,26,22,0.45)',
  white: '#ffffff',
  /** Dark chip over a photo (remove button). */
  photoScrim: 'rgba(31,26,22,0.7)',
  viewerBackdrop: 'rgba(0,0,0,0.92)',
  viewerControl: 'rgba(255,255,255,0.16)',
  /** Translucent brand fill for the coverage circle. */
  coverageFill: 'rgba(201,74,20,0.14)',
  sage: '#e3eae6',
} as const;

export const gradients = {
  /** Sage panel behind appliance scenes and photos. */
  cover: ['#e3eae6', '#d6e0da'],
  /** White to a faint warm tint, for featured cards. */
  cardGlow: ['#ffffff', '#fff8f3'],
  /** Landing bands, used softly behind hero areas. */
  bandMint: ['#bce0ce', '#d8efe3', '#f3e8d8'],
  bandSand: ['#f5dfc9', '#efe6da', '#d4e7dd'],
  /** AI glow stops: terracotta, sun, emerald, back to terracotta. */
  ai: ['#c94a14', '#e7a52a', '#059669', '#c94a14'],
} as const;

/** Horizontal screen gutter. */
export const GUTTER = 20;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  card: 18,
  pill: 999,
} as const;

/** Minimum touch target in points. */
export const TOUCH = 48;

export const fonts = {
  heading: 'PlusJakartaSans_700Bold',
  headingXL: 'PlusJakartaSans_800ExtraBold',
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

// Warm, brown-tinted shadows like the web tokens.
export const shadow = {
  card: {
    shadowColor: '#1c1917',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  lift: {
    shadowColor: '#4a2e18',
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 22 },
    elevation: 8,
  },
  sheet: {
    shadowColor: '#4a2e18',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
} as const;
