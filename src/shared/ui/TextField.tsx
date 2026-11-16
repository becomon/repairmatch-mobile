import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius, TOUCH } from '../theme';
import { Icon } from './Icon';
import { Text } from './Text';

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  hint?: string;
  /** Shows the character counter, e.g. `63/1000`. */
  maxLength?: number;
}

export function TextField({ label, error, hint, multiline, secureTextEntry, value, maxLength, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isPassword = !!secureTextEntry;
  return (
    <View style={styles.wrap}>
      <Text variant="smallStrong" color={colors.textSoft}>{label}</Text>
      <View style={[styles.box, focused && styles.focused, !!error && styles.errored, multiline && styles.multiline]}>
        <TextInput
          {...rest}
          value={value}
          maxLength={maxLength}
          multiline={multiline}
          secureTextEntry={isPassword && hidden}
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.inputMultiline]}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            onPress={() => setHidden((h) => !h)}
            style={styles.eye}
          >
            <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.meta}>
        {error ? (
          <Text variant="small" color={colors.danger} style={styles.metaText} accessibilityRole="alert">{error}</Text>
        ) : hint ? (
          <Text variant="small" color={colors.textMuted} style={styles.metaText}>{hint}</Text>
        ) : (
          <View style={styles.metaText} />
        )}
        {maxLength && multiline ? (
          <Text variant="small" color={colors.textMuted}>{(value ?? '').length}/{maxLength}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH + 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  multiline: { alignItems: 'flex-start', paddingVertical: 10 },
  focused: { borderColor: colors.primary, borderWidth: 2 },
  errored: { borderColor: colors.danger },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.text, paddingVertical: 10, outlineStyle: 'none' } as never,
  inputMultiline: { minHeight: 96 },
  eye: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: -8 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  metaText: { flex: 1 },
});
