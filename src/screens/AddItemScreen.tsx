import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ItemForm, { type ItemFormResult } from '../components/ItemForm';
import type { Item } from '../models';
import type { RootStackParamList } from '../navigation/types';
import { useItems } from '../state/ItemsContext';
import { generateLocalId } from '../utils/id';

type Props = NativeStackScreenProps<RootStackParamList, 'AddItem'>;

export default function AddItemScreen({ navigation }: Props) {
  const { addItem } = useItems();

  function handleSubmit(result: ItemFormResult) {
    const now = new Date().toISOString();

    const newItem: Item = {
      id: generateLocalId('item'),
      title: result.title,
      type: result.type,
      customTypeLabel: result.customTypeLabel,
      category: result.category,
      createdAt: now,
      updatedAt: now,
      captureType: result.sourceUrl ? 'url' : 'manual',
      sourceUrl: result.sourceUrl,
      originalText: result.originalText,
      tags: result.tags,
    };

    addItem(newItem);
    navigation.goBack();
  }

  return <ItemForm onSubmit={handleSubmit} />;
}
