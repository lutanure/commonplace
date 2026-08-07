import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Item } from '../models';
import type { RootStackParamList } from '../navigation/types';
import { useItems } from '../state/ItemsContext';
import { generateLocalId } from '../utils/id';
import { parseTagsInput } from '../utils/tags';
import { normalizeUrl } from '../utils/url';

type Props = NativeStackScreenProps<RootStackParamList, 'AddItem'>;

type CaptureOption = 'idea' | 'note' | 'link';

const CAPTURE_OPTIONS: { value: CaptureOption; label: string }[] = [
  { value: 'idea', label: 'Idea' },
  { value: 'note', label: 'Note' },
  { value: 'link', label: 'Link' },
];

export default function AddItemScreen({ navigation }: Props) {
  const { addItem } = useItems();

  const [option, setOption] = useState<CaptureOption>('idea');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const normalizedUrl = useMemo(() => normalizeUrl(url), [url]);

  const isValid = useMemo(() => {
    if (option === 'link') {
      return normalizedUrl !== null;
    }
    return title.trim().length > 0 && content.trim().length > 0;
  }, [option, title, content, normalizedUrl]);

  function resetForm() {
    setTitle('');
    setContent('');
    setUrl('');
    setCategory('');
    setTagsInput('');
  }

  function handleSave() {
    if (!isValid) {
      return;
    }

    const now = new Date().toISOString();
    const tags = parseTagsInput(tagsInput);
    const trimmedCategory = category.trim();
    const resolvedCategory = trimmedCategory || undefined;

    let newItem: Item;

    if (option === 'link') {
      // isValid guarantees normalizedUrl is non-null here.
      const sourceUrl = normalizedUrl!;
      newItem = {
        id: generateLocalId('item'),
        title: title.trim() || sourceUrl,
        type: 'other',
        category: resolvedCategory,
        createdAt: now,
        updatedAt: now,
        captureType: 'url',
        sourceUrl,
        tags,
      };
    } else {
      newItem = {
        id: generateLocalId('item'),
        title: title.trim(),
        type: option,
        category: resolvedCategory,
        createdAt: now,
        updatedAt: now,
        captureType: 'manual',
        originalText: content.trim(),
        tags,
      };
    }

    addItem(newItem);
    resetForm();
    navigation.goBack();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.segmentedControl}>
        {CAPTURE_OPTIONS.map((item) => {
          const selected = item.value === option;
          return (
            <Pressable
              key={item.value}
              style={[styles.segment, selected && styles.segmentSelected]}
              onPress={() => setOption(item.value)}
            >
              <Text
                style={[
                  styles.segmentText,
                  selected && styles.segmentTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {option === 'link' ? (
        <View style={styles.field}>
          <Text style={styles.label}>URL</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="example.com"
            placeholderTextColor="#9A9A9A"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>
      ) : null}

      <View style={styles.field}>
        <Text style={styles.label}>
          {option === 'link' ? 'Title (optional)' : 'Title'}
        </Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={
            option === 'idea'
              ? 'Give this idea a name'
              : option === 'note'
                ? 'Give this note a name'
                : 'How should this link be labeled?'
          }
          placeholderTextColor="#9A9A9A"
        />
      </View>

      {option !== 'link' ? (
        <View style={styles.field}>
          <Text style={styles.label}>
            {option === 'idea' ? 'Idea' : 'Note'}
          </Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={content}
            onChangeText={setContent}
            placeholder={
              option === 'idea'
                ? "What's the idea?"
                : "What's on your mind?"
            }
            placeholderTextColor="#9A9A9A"
            multiline
            textAlignVertical="top"
          />
        </View>
      ) : null}

      <View style={styles.field}>
        <Text style={styles.label}>Category (optional)</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="e.g. product idea, travel, work"
          placeholderTextColor="#9A9A9A"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Tags (optional)</Text>
        <TextInput
          style={styles.input}
          value={tagsInput}
          onChangeText={setTagsInput}
          placeholder="comma, separated, tags"
          placeholderTextColor="#9A9A9A"
          autoCapitalize="none"
        />
      </View>

      <Pressable
        style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!isValid}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>

      {!isValid ? (
        <Text style={styles.hint}>
          {option === 'link'
            ? 'Enter a web address, e.g. example.com'
            : 'Title and content are required.'}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  segmentSelected: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B6B6B',
  },
  segmentTextSelected: {
    color: '#1A1A1A',
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B6B6B',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  multilineInput: {
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.35,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    marginTop: 10,
    fontSize: 13,
    color: '#9A9A9A',
    textAlign: 'center',
  },
});
