import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Tag from '../components/Tag';
import type { RootStackParamList } from '../navigation/types';
import { useItems } from '../state/ItemsContext';
import { getItemTypeLabel } from '../utils/itemTypeLabel';

type Props = NativeStackScreenProps<RootStackParamList, 'ItemDetail'>;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getDomain(url: string): string | undefined {
  const match = url.match(/^[a-z]+:\/\/(?:www\.)?([^/?#]+)/i);
  return match?.[1];
}

async function openSourceUrl(url: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert("Can't open this link", "This source link can't be opened on this device.");
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert("Can't open this link", 'Something went wrong trying to open this link.');
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function MediaPreview({ uri }: { uri: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View style={styles.mediaPlaceholder}>
        <Text style={styles.mediaPlaceholderText}>Media unavailable</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={styles.media}
      onError={() => setFailed(true)}
    />
  );
}

export default function ItemDetailScreen({ route, navigation }: Props) {
  const { itemId } = route.params;
  const { getItemById, deleteItem } = useItems();
  const item = getItemById(itemId);

  useEffect(() => {
    navigation.setOptions({ title: item?.title ?? 'Item' });
  }, [navigation, item?.title]);

  if (!item) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.notFound}>This item could not be found.</Text>
        </ScrollView>
      </View>
    );
  }

  function handleDeletePress() {
    Alert.alert('Delete this item?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteItem(itemId);
          navigation.popToTop();
        },
      },
    ]);
  }

  const hasKnowledge = Boolean(
    item.summary || (item.relevantInfo && item.relevantInfo.length > 0)
  );
  const hasLabels = Boolean(
    item.tags.length > 0 || (item.entities && item.entities.length > 0)
  );
  const hasSource = Boolean(
    item.sourceName || item.sourceUrl || item.originalText
  );
  const hasPersonalContext = Boolean(item.userNote || item.whySaved);
  const sourceUrl = item.sourceUrl;
  const sourceDomain = sourceUrl ? getDomain(sourceUrl) : undefined;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Primary content */}
        <View style={styles.section}>
          {item.mediaUri ? <MediaPreview uri={item.mediaUri} /> : null}

          <Text style={styles.title}>{item.title}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.typeBadge}>{getItemTypeLabel(item)}</Text>
            {item.category ? (
              <Text style={styles.category}>{item.category}</Text>
            ) : null}
          </View>

          <Text style={styles.savedDate}>Saved {formatDate(item.createdAt)}</Text>
        </View>

        {/* What Commonplace knows */}
        {hasKnowledge ? (
          <Section title="What Commonplace knows">
            {item.summary ? (
              <Text style={styles.summary}>{item.summary}</Text>
            ) : null}

            {item.relevantInfo && item.relevantInfo.length > 0 ? (
              <View style={item.summary ? styles.factsList : undefined}>
                {item.relevantInfo.map((fact, index) => (
                  <View key={`${fact.label}-${index}`} style={styles.factRow}>
                    <Text style={styles.factLabel}>{fact.label}</Text>
                    <Text style={styles.factValue}>{fact.value}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Section>
        ) : null}

        {/* Tags / entities */}
        {hasLabels ? (
          <Section title="Tags & entities">
            {item.tags.length > 0 ? (
              <View style={styles.chipRow}>
                {item.tags.map((tag) => (
                  <Tag key={tag.id} label={tag.name} />
                ))}
              </View>
            ) : null}

            {item.entities && item.entities.length > 0 ? (
              <View
                style={[
                  styles.chipRow,
                  item.tags.length > 0 && styles.chipRowSpaced,
                ]}
              >
                {item.entities.map((entity) => (
                  <Tag key={entity} label={entity} variant="outline" />
                ))}
              </View>
            ) : null}
          </Section>
        ) : null}

        {/* Source */}
        {hasSource ? (
          <Section title="Source">
            {item.sourceName ? (
              <Text style={styles.sourceLine}>{item.sourceName}</Text>
            ) : null}
            {sourceUrl ? (
              <Pressable
                onPress={() => openSourceUrl(sourceUrl)}
                style={({ pressed }) => [
                  styles.sourceLink,
                  pressed && styles.sourceLinkPressed,
                ]}
              >
                <Text style={styles.sourceLinkText}>Open original ↗</Text>
                {sourceDomain ? (
                  <Text style={styles.sourceDomain}>{sourceDomain}</Text>
                ) : null}
              </Pressable>
            ) : null}
            {item.originalText ? (
              <View style={styles.originalTextBlock}>
                <Text style={styles.originalText}>{item.originalText}</Text>
              </View>
            ) : null}
          </Section>
        ) : null}

        {/* Personal context */}
        {hasPersonalContext ? (
          <Section title="Personal context">
            {item.whySaved ? (
              <Text style={styles.personalLine}>{item.whySaved}</Text>
            ) : null}
            {item.userNote ? (
              <Text style={styles.personalLine}>{item.userNote}</Text>
            ) : null}
          </Section>
        ) : null}

        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.editButton,
              pressed && styles.editButtonPressed,
            ]}
            onPress={() => navigation.navigate('EditItem', { itemId: item.id })}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}
            onPress={handleDeletePress}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 48,
  },
  notFound: {
    fontSize: 15,
    color: '#9A9A9A',
    marginTop: 40,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9A9A9A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  media: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    backgroundColor: '#EFEFEF',
    marginBottom: 16,
  },
  mediaPlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    backgroundColor: '#EFEFEF',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlaceholderText: {
    fontSize: 14,
    color: '#9A9A9A',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 30,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9A9A9A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  category: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  savedDate: {
    marginTop: 8,
    fontSize: 13,
    color: '#9A9A9A',
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4A4A4A',
  },
  factsList: {
    marginTop: 14,
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
  },
  factLabel: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  factValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginLeft: 12,
    flexShrink: 1,
    textAlign: 'right',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipRowSpaced: {
    marginTop: 12,
  },
  sourceLine: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 4,
  },
  sourceLink: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 2,
    marginBottom: 4,
  },
  sourceLinkPressed: {
    opacity: 0.6,
  },
  sourceLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  sourceDomain: {
    fontSize: 13,
    color: '#9A9A9A',
  },
  originalTextBlock: {
    marginTop: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E5E5',
  },
  originalText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B6B6B',
    fontStyle: 'italic',
  },
  personalLine: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4A4A4A',
    marginBottom: 6,
  },
  actionRow: {
    marginTop: 8,
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  editButtonPressed: {
    backgroundColor: '#F0F0F0',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  deleteButton: {
    borderColor: '#E5484D',
  },
  deleteButtonPressed: {
    backgroundColor: '#FDECEC',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E5484D',
  },
});
