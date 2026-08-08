import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Item } from '../models';
import { colors, radii, spacing, typography } from '../theme';
import TypePill from './TypePill';

function relevantSnippet(item: Item): string | undefined {
  if (item.summary) {
    return item.summary;
  }
  if (item.relevantInfo && item.relevantInfo.length > 0) {
    const fact = item.relevantInfo[0];
    return `${fact.label}: ${fact.value}`;
  }
  return item.originalText;
}

function formatCardDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    .toUpperCase();
}

// Deliberately restrained: the type pill is the only color-coded element,
// title and snippet carry the visual weight, and date/metadata stay quiet
// — an archive fragment, not a data box. Category and tags are shown in
// full on Item Detail; repeating them here would compete with the title
// for attention on a list that's meant to be scanned quickly.
export default function ItemCard({
  item,
  onPress,
}: {
  item: Item;
  onPress?: () => void;
}) {
  const snippet = relevantSnippet(item);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <TypePill item={item} />
        <Text style={styles.date}>{formatCardDate(item.createdAt)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>

      {snippet ? (
        <Text style={styles.snippet} numberOfLines={2}>
          {snippet}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardPressed: {
    backgroundColor: colors.paperElevated,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    ...typography.caption,
    letterSpacing: 0.4,
  },
  title: {
    ...typography.cardTitle,
    marginTop: spacing.sm + 2,
  },
  snippet: {
    ...typography.bodyMuted,
    marginTop: spacing.xs + 2,
  },
});
