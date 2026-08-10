import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

type ButtonVariant = 'primary' | 'neutral' | 'destructive';

interface VariantStyle {
  container: ViewStyle;
  pressed: ViewStyle;
  label: { color: string };
}

const VARIANTS: Record<ButtonVariant, VariantStyle> = {
  primary: {
    container: { backgroundColor: colors.accent, borderColor: colors.accent },
    pressed: {
      backgroundColor: colors.accentPressed,
      borderColor: colors.accentPressed,
    },
    label: { color: colors.cream },
  },
  neutral: {
    container: {
      backgroundColor: colors.surface,
      borderColor: colors.borderStrong,
    },
    pressed: { backgroundColor: colors.surfaceSunken },
    label: { color: colors.textPrimary },
  },
  destructive: {
    container: { backgroundColor: 'transparent', borderColor: colors.danger },
    pressed: { backgroundColor: colors.surfaceSunken },
    label: { color: colors.danger },
  },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const variantStyle = VARIANTS[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyle.container,
        pressed && variantStyle.pressed,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.label, variantStyle.label]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    paddingVertical: spacing.md + 2,
  },
  label: {
    ...typography.button,
  },
  disabled: {
    opacity: 0.4,
  },
});
