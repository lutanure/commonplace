import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Item } from '../models';
import { getItemTypeLabel } from '../utils/itemTypeLabel';
import Tag from './Tag';

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
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.typeBadge}>{getItemTypeLabel(item)}</Text>
      </View>

      {item.category ? (
        <Text style={styles.category}>{item.category}</Text>
      ) : null}

      {snippet ? (
        <Text style={styles.snippet} numberOfLines={2}>
          {snippet}
        </Text>
      ) : null}

      {item.tags.length > 0 ? (
        <View style={styles.tagRow}>
          {item.tags.map((tag) => (
            <Tag key={tag.id} label={tag.name} />
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 16,
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9A9A9A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  category: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B6B6B',
  },
  snippet: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#4A4A4A',
  },
  tagRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
