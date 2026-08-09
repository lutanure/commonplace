import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import ItemForm, { type ItemFormResult } from '../components/ItemForm';
import type { RootStackParamList } from '../navigation/types';
import { useItems } from '../state/ItemsContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AddItem'>;

export default function AddItemScreen({ navigation }: Props) {
  const { addItem } = useItems();

  async function handleSubmit(result: ItemFormResult) {
    try {
      await addItem({
        title: result.title,
        type: result.type,
        customTypeLabel: result.customTypeLabel,
        category: result.category,
        captureType: result.sourceUrl ? 'url' : 'manual',
        sourceName: result.sourceName,
        sourceUrl: result.sourceUrl,
        originalText: result.originalText,
        tags: result.tags,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Couldn't save this item",
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    }
  }

  return <ItemForm onSubmit={handleSubmit} />;
}
