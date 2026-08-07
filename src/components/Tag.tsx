import { StyleSheet, Text, View } from 'react-native';

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
    backgroundColor: '#F0F0F0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  text: {
    fontSize: 12,
    color: '#4A4A4A',
  },
});
