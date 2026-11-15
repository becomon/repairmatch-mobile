import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius, shadow } from '../theme';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  /** Highlight border, used for the recommended / selected card. */
  highlight?: boolean;
  accessibilityLabel?: string;
}

export function Card({ children, onPress, style, highlight, accessibilityLabel }: Props) {
  const base = [styles.card, highlight ? styles.highlight : null, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [...base, pressed ? { opacity: 0.85 } : null]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadow.card,
  },
  highlight: { borderWidth: 2, borderColor: colors.accent },
});
