import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme';

export default function BackControl({
  label,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `Back to ${label}`}
      style={({ pressed }) => [
        styles.backControl,
        pressed && styles.backControlPressed,
      ]}
    >
      <Text style={styles.backControlText}>‹ {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backControl: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backControlPressed: {
    opacity: 0.6,
  },
  backControlText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.tomato,
  },
});
