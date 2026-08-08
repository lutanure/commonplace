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
import Button from '../components/Button';
import Tag from '../components/Tag';
import TypePill from '../components/TypePill';
import type { RootStackParamList } from '../navigation/types';
import { useItems } from '../state/ItemsContext';
import { colors, radii, spacing, typography } from '../theme';

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
      Alert.alert(
        "Can't open this link",
        "This source link can't be opened on this device."
      );
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      "Can't open this link",
      'Something went wrong trying to open this link.'
    );
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

          <TypePill item={item} />

          <Text style={styles.title}>{item.title}</Text>

          {item.category ? (
            <Text style={styles.category}>{item.category}</Text>
          ) : null}

          <Text style={styles.savedDate}>
            Saved {formatDate(item.createdAt)}
          </Text>
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
              <View style={styles.originalTextBlock}>
                <Text style={styles.originalText}>{item.userNote}</Text>
              </View>
            ) : null}
          </Section>
        ) : null}

        <View style={styles.actionRow}>
          <Button
            label="Edit"
            variant="neutral"
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditItem', { itemId: item.id })}
          />
          <Button
            label="Delete"
            variant="destructive"
            style={styles.actionButton}
            onPress={handleDeletePress}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  notFound: {
    fontSize: 15,
    color: colors.inkFaint,
    marginTop: spacing.xxl,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.label,
    marginBottom: spacing.md - 2,
  },
  media: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.sm,
    backgroundColor: colors.paperMuted,
    marginBottom: spacing.lg,
  },
  mediaPlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.sm,
    backgroundColor: colors.paperMuted,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlaceholderText: {
    fontSize: 14,
    color: colors.inkFaint,
  },
  title: {
    ...typography.displayLG,
    marginTop: spacing.md,
  },
  category: {
    marginTop: spacing.xs + 2,
    fontSize: 13,
    color: colors.inkMuted,
  },
  savedDate: {
    marginTop: spacing.sm,
    ...typography.caption,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  factsList: {
    marginTop: spacing.md + 2,
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  factLabel: {
    fontSize: 14,
    color: colors.inkMuted,
  },
  factValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
    marginLeft: spacing.md,
    flexShrink: 1,
    textAlign: 'right',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm - 2,
  },
  chipRowSpaced: {
    marginTop: spacing.md,
  },
  sourceLine: {
    fontSize: 14,
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  sourceLink: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  sourceLinkPressed: {
    opacity: 0.6,
  },
  sourceLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.tomato,
  },
  sourceDomain: {
    fontSize: 13,
    color: colors.inkFaint,
  },
  originalTextBlock: {
    marginTop: spacing.sm,
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.tomato,
  },
  originalText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    fontStyle: 'italic',
  },
  personalLine: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    marginBottom: spacing.sm - 2,
  },
  actionRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
