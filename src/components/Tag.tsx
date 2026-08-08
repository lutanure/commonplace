import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme';

export default function Tag({
  label,
  variant = 'filled',
}: {
  label: string;
  variant?: 'filled' | 'outline';
}) {
  return (
    <View style={[styles.chip, variant === 'outline' && styles.chipOutline]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.paperElevated,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  chipOutline: {
    backgroundColor: 'transparent',
    borderColor: colors.hairlineStrong,
  },
  text: {
    fontSize: 12,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
