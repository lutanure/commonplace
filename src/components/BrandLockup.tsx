import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import BrandMark from './BrandMark';

// Compact mark + wordmark lockup for the Library header.
export default function BrandLockup() {
  return (
    <View style={styles.row} testID="brand-lockup">
      {/* Flexbox centers the mark against the wordmark's full 34px line box,
          but Bowlby One's cap-height sits well above that box's center, so
          the mark needs an upward optical nudge to read as centered against
          the actual glyphs rather than the line box. */}
      <View style={styles.markWrap}>
        <BrandMark size={26} />
      </View>
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
  markWrap: {
    marginTop: -12,
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
