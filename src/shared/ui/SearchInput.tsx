import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts, radius, TOUCH } from '../theme';
import { Icon } from './Icon';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  /** Accessible name; the placeholder is not a label. */
  label: string;
  maxLength?: number;
}

/** Compact search box with a clear button. Debounce the value in the caller. */
export function SearchInput({ value, onChangeText, placeholder, label, maxLength = 100 }: Props) {
  return (
    <View style={styles.box}>
      <Icon name="search" size={20} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={maxLength}
        style={styles.input}
      />
      {value.length > 0 ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Borrar búsqueda" onPress={() => onChangeText('')} style={styles.clear} hitSlop={4}>
          <Icon name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: TOUCH,
    paddingLeft: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.text, paddingVertical: 10, outlineStyle: 'none' } as never,
  clear: { width: TOUCH - 4, height: TOUCH - 4, alignItems: 'center', justifyContent: 'center' },
});
