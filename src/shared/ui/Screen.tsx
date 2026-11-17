import { KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, GUTTER, gradients, shadow } from '../theme';

interface Props {
  children: React.ReactNode;
  /** Fixed header (usually `ScreenHeader`). Sits below the status bar inset. */
  header?: React.ReactNode;
  /** Sticky bottom action area (the single primary CTA of the screen). */
  footer?: React.ReactNode;
  /** `false` when the children bring their own list (FlatList). */
  scroll?: boolean;
  /** Pull to refresh for scrollable screens. */
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Screens inside the tab bar do not add the bottom safe-area inset. */
  inTabs?: boolean;
  contentStyle?: ViewStyle;
  /** Soft warm band behind the top of the screen, like the web landing bands. */
  band?: 'mint' | 'sand';
}

/** Page wrapper: safe areas, 20pt gutters, optional sticky footer and keyboard avoidance. */
export function Screen({ children, header, footer, scroll = true, onRefresh, refreshing = false, inTabs = false, contentStyle, band }: Props) {
  const insets = useSafeAreaInsets();
  const bottomInset = inTabs ? 0 : insets.bottom;
  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior="padding"
    >
      {band ? (
        <LinearGradient
          pointerEvents="none"
          colors={[...(band === 'mint' ? gradients.bandMint : gradients.bandSand), colors.background]}
          style={styles.band}
        />
      ) : null}
      {header}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[styles.content, { paddingBottom: footer ? 24 : bottomInset + 24 }, contentStyle]}
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} /> : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{children}</View>
      )}
      {footer ? <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, 12) + 8 }]}>{footer}</View> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  band: { position: 'absolute', top: 0, left: 0, right: 0, height: 320, opacity: 0.75 },
  content: { paddingHorizontal: GUTTER, paddingTop: 8, gap: 16 },
  footer: {
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    gap: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.navLine,
    ...shadow.sheet,
  },
});
