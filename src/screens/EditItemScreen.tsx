import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import BackControl from '../components/BackControl';
import ItemForm, { type ItemFormResult } from '../components/ItemForm';
import type { CaptureType, Item } from '../models';
import type { RootStackParamList } from '../navigation/types';
import { useItems } from '../state/ItemsContext';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EditItem'>;

// Editing shouldn't be able to erase how an item actually entered
// Commonplace. A new/changed Source URL always means 'url'. Otherwise,
// if the item didn't originate from a manual entry or a URL to begin
// with (e.g. a screenshot or pasted text), keep that origin — clearing
// an empty Source URL field should never masquerade as "this was
// manually typed in" for something that wasn't.
function resolveCaptureType(
  original: Item,
  submittedSourceUrl: string | undefined
): CaptureType {
  if (submittedSourceUrl) {
    return 'url';
  }
  if (original.captureType !== 'manual' && original.captureType !== 'url') {
    return original.captureType;
  }
  return 'manual';
}

export default function EditItemScreen({ route, navigation }: Props) {
  const { itemId } = route.params;
  const { getItemById, updateItem } = useItems();
  const item = getItemById(itemId);

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <BackControl label="Back" onPress={() => navigation.goBack()} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFound}>This item could not be found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Bound to a non-optional `Item` here so `handleSubmit` below (a nested
  // function, checked independently of this guard) doesn't need its own
  // narrowing/undefined check for something we already know is defined.
  const editableItem: Item = item;

  async function handleSubmit(result: ItemFormResult) {
    try {
      await updateItem(editableItem.id, {
        title: result.title,
        type: result.type,
        customTypeLabel: result.customTypeLabel,
        category: result.category,
        captureType: resolveCaptureType(editableItem, result.sourceUrl),
        sourceName: result.sourceName,
        sourceUrl: result.sourceUrl,
        originalText: result.originalText,
        tags: result.tags,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Couldn't save changes",
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackControl label="Back" onPress={() => navigation.goBack()} />
      <ItemForm initialItem={editableItem} onSubmit={handleSubmit} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFound: {
    fontSize: 15,
    color: colors.inkFaint,
    textAlign: 'center',
  },
});
