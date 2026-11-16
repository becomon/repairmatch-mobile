import { colors, fonts } from '../theme';

/** Shared look of the bottom tab bar for both roles. */
export const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle: { fontFamily: fonts.bodySemi, fontSize: 12 },
  tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.navLine },
  tabBarItemStyle: { minHeight: 48 },
} as const;
