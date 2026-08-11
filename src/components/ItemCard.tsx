import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { Item } from '../models';
import { useItems } from '../state/ItemsContext';
import { colors, radii, spacing, typography } from '../theme';
import TypePill from './TypePill';

// The personal-note preview: what the user themselves wrote about this
// item takes priority over anything AI-derived, since that's the more
// personally meaningful reminder of why it was saved. Falls back through
// the same chain the card used before userNote existed.
function notePreview(item: Item): string | undefined {
  if (item.userNote) {
    return item.userNote;
  }
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

function DeleteAction({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        styles.deleteAction,
        pressed && styles.actionPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Delete item"
    >
      <Text style={styles.actionText}>Delete</Text>
    </Pressable>
  );
}

function PinAction({
  isPinned,
  onPress,
}: {
  isPinned: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        styles.pinAction,
        pressed && styles.actionPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={isPinned ? 'Unpin item' : 'Pin item'}
    >
      <Text style={styles.actionText}>{isPinned ? 'Unpin' : 'Pin'}</Text>
    </Pressable>
  );
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
  const { updateItem, deleteItem } = useItems();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const [isOpen, setIsOpen] = useState(false);
  const snippet = notePreview(item);

  function handleTogglePin() {
    swipeableRef.current?.close();
    updateItem(item.id, { isPinned: !item.isPinned }).catch((error) => {
      Alert.alert(
        "Couldn't update this item",
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    });
  }

  function handleDeletePress() {
    swipeableRef.current?.close();
    Alert.alert('Delete this item?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteItem(item.id).catch((error) => {
            Alert.alert(
              "Couldn't delete this item",
              error instanceof Error
                ? error.message
                : 'Something went wrong. Please try again.'
            );
          });
        },
      },
    ]);
  }

  function handleCardPress() {
    // A swipe panel left open is the more likely intent than navigation —
    // close it instead of also opening the item, so a swipe never reads
    // as an accidental tap-through.
    if (isOpen) {
      swipeableRef.current?.close();
      return;
    }
    onPress?.();
  }

  return (
    <Swipeable
      ref={swipeableRef}
      overshootLeft={false}
      overshootRight={false}
      leftThreshold={40}
      rightThreshold={40}
      onSwipeableWillOpen={() => setIsOpen(true)}
      onSwipeableWillClose={() => setIsOpen(false)}
      renderLeftActions={() => (
        <PinAction isPinned={item.isPinned} onPress={handleTogglePin} />
      )}
      renderRightActions={() => <DeleteAction onPress={handleDeletePress} />}
    >
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={handleCardPress}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TypePill item={item} />
            {item.isPinned ? (
              <Text style={styles.pinnedLabel}>Pinned</Text>
            ) : null}
          </View>
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
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.brandOchre,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardPressed: {
    backgroundColor: colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  // Reuses the core palette's quiet olive accent for the pin indicator —
  // this is not type/tag color-coding, just a reused hue for a UI state.
  pinnedLabel: {
    ...typography.label,
    color: colors.olive,
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
  action: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    marginBottom: spacing.md,
    borderRadius: radii.sm,
  },
  actionPressed: {
    opacity: 0.8,
  },
  deleteAction: {
    marginLeft: spacing.sm,
    backgroundColor: colors.danger,
  },
  pinAction: {
    marginRight: spacing.sm,
    backgroundColor: colors.olive,
  },
  actionText: {
    ...typography.button,
    color: colors.cream,
  },
});
