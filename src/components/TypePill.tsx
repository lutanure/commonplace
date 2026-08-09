import { StyleSheet, Text, View } from 'react-native';
import type { Item } from '../models';
import { getItemDisplayColor, radii, spacing, typography } from '../theme';
import { getItemTypeLabel } from '../utils/itemTypeLabel';

// The main color-coded element for an Item's type — used on the library
// card, the detail header, and the type selector in the Add/Edit form, so
// a given type always reads as the same color everywhere in the app.
export default function TypePill({
  item,
}: {
  item: Pick<Item, 'type' | 'captureType' | 'customTypeLabel'>;
}) {
  const { background, text } = getItemDisplayColor(item);
  const label = getItemTypeLabel(item);

  return (
    <View style={[styles.pill, { backgroundColor: background }]}>
      <Text style={[styles.label, { color: text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  label: {
    ...typography.label,
    letterSpacing: 0.6,
  },
});
