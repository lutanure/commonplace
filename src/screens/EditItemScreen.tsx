import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ItemForm, { type ItemFormResult } from '../components/ItemForm';
import type { CaptureType, Item } from '../models';
import type { RootStackParamList } from '../navigation/types';
import { useItems } from '../state/ItemsContext';

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
      <View style={styles.container}>
        <Text style={styles.notFound}>This item could not be found.</Text>
        <Pressable
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  // Bound to a non-optional `Item` here so `handleSubmit` below (a nested
  // function, checked independently of this guard) doesn't need its own
  // narrowing/undefined check for something we already know is defined.
  const editableItem: Item = item;

  function handleSubmit(result: ItemFormResult) {
    updateItem(editableItem.id, {
      title: result.title,
      type: result.type,
      customTypeLabel: result.customTypeLabel,
      category: result.category,
      captureType: resolveCaptureType(editableItem, result.sourceUrl),
      sourceUrl: result.sourceUrl,
      originalText: result.originalText,
      tags: result.tags,
    });
    navigation.goBack();
  }

  return <ItemForm initialItem={editableItem} onSubmit={handleSubmit} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFound: {
    fontSize: 15,
    color: '#9A9A9A',
    textAlign: 'center',
    marginBottom: 16,
  },
  goBackButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  goBackButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
