import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, GUTTER, TOUCH } from '../theme';
import { Icon } from './Icon';
import { Text } from './Text';

interface Props {
  title: string;
  subtitle?: string;
  /** Shows the back arrow. Where it goes when there is no history is `fallbackHref`. */
  back?: boolean;
  fallbackHref?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, back = false, fallbackHref = '/', right }: Props) {
  const router = useRouter();
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(fallbackHref as never);
  };
  return (
    <View style={styles.row}>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={goBack} style={styles.back} hitSlop={4}>
          <Icon name="chevron-back" size={24} />
        </Pressable>
      ) : null}
      <View style={styles.titles}>
        <Text variant="title" numberOfLines={1}>{title}</Text>
        {subtitle ? <Text variant="small" color={colors.textMuted} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 8, minHeight: TOUCH + 8 },
  back: { width: TOUCH - 4, height: TOUCH, alignItems: 'center', justifyContent: 'center', marginLeft: -12 },
  titles: { flex: 1, gap: 2 },
});
