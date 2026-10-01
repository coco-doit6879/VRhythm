import React, { createContext, forwardRef, useContext } from 'react';
import { Text as NativeText, TextInput as NativeInput, StyleSheet, TextProps, TextInputProps, TextStyle } from 'react-native';
import { Colors } from '../constants/Colors';

const Weight = createContext<TextStyle['fontWeight']>(undefined);
const fonts = {
  regular: 'BeVietnamPro_400Regular',
  medium: 'BeVietnamPro_500Medium',
  semibold: 'BeVietnamPro_600SemiBold',
  bold: 'BeVietnamPro_700Bold',
};
function fontFor(weight: TextStyle['fontWeight']) {
  const value = weight === 'bold' ? 700 : Number(weight) || 400;
  return value >= 700 ? fonts.bold : value >= 600 ? fonts.semibold : value >= 500 ? fonts.medium : fonts.regular;
}

/** Native text scaling stays enabled; nested emphasis inherits its parent's weight. */
export function Text({ style, children, ...props }: TextProps) {
  const parentWeight = useContext(Weight);
  const flattened = StyleSheet.flatten(style);
  const weight = flattened?.fontWeight ?? parentWeight ?? '400';
  return <Weight.Provider value={weight}>
    <NativeText {...props} style={[parentWeight === undefined && { color: Colors.light.text, fontSize: 15 }, style,
      { fontFamily: flattened?.fontFamily ?? fontFor(weight), fontWeight: 'normal' }]}>{children}</NativeText>
  </Weight.Provider>;
}

export const TextInput = forwardRef<NativeInput, TextInputProps>(function TextInput({ style, ...props }, ref) {
  return <NativeInput ref={ref} placeholderTextColor={Colors.light.textMuted} selectionColor={Colors.primary}
    {...props} style={[{ fontFamily: fonts.regular, fontSize: 16, color: Colors.light.text }, style]} />;
});
