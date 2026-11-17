import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { colors, typography, type TypographyVariant } from '../theme';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: TextStyle['textAlign'];
}

/** App text: applies the type scale and caps font scaling so layouts do not overflow. */
export function Text({ variant = 'body', color = colors.text, align, style, ...rest }: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={1.25}
      {...rest}
      style={[typography[variant], { color }, align ? { textAlign: align } : null, style]}
    />
  );
}
