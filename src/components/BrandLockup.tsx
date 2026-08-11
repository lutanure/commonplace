import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import BrandMark from './BrandMark';

// Compact mark + wordmark lockup for the Library header. Per the identity
// reference, the trailing dot is a solid graphic circle (not a typographic
// character), so it's rendered as its own small `View`, not text.
export default function BrandLockup() {
  return (
    <View style={styles.row} testID="brand-lockup">
      <BrandMark size={26} />
      <Text style={styles.wordmark} testID="brand-lockup-wordmark">
        Common
        <Text style={styles.place} testID="brand-lockup-place">
          place
        </Text>
      </Text>
      <View style={styles.dot} testID="brand-lockup-dot" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordmark: {
    ...typography.displayXL,
    color: colors.brandPlum,
    lineHeight: 34,
    marginLeft: spacing.xs + 2,
  },
  place: {
    color: colors.brandOrange,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandOchre,
    marginLeft: spacing.xs,
    marginBottom: 4,
  },
});
