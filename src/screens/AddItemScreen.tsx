import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { Item, ItemType } from '../models';
import type { RootStackParamList } from '../navigation/types';
import { useItems } from '../state/ItemsContext';
import { generateLocalId } from '../utils/id';
import { getItemTypeLabel } from '../utils/itemTypeLabel';
import { parseTagsInput } from '../utils/tags';
import { normalizeTypeKey, searchItemTypes } from '../utils/typeTaxonomy';
import { normalizeUrl } from '../utils/url';

type Props = NativeStackScreenProps<RootStackParamList, 'AddItem'>;

// Sensible per-type wording for the shared content field — not a unique
// form per type, just a friendlier label/placeholder where it's easy.
const CONTENT_FIELD: Partial<Record<ItemType, { label: string; placeholder: string }>> = {
  idea: { label: 'Idea', placeholder: "What's the idea?" },
  note: { label: 'Note', placeholder: "What's on your mind?" },
  quote: { label: 'Quote', placeholder: 'The quote itself' },
};
const DEFAULT_CONTENT_FIELD = {
  label: 'Notes',
  placeholder: 'Any details worth remembering',
};

export default function AddItemScreen({ navigation }: Props) {
  const { items, addItem } = useItems();

  const [type, setType] = useState<ItemType>('idea');
  const [customTypeLabel, setCustomTypeLabel] = useState('');
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [typeQuery, setTypeQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrlInput, setSourceUrlInput] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const trimmedUrl = sourceUrlInput.trim();
  const hasUrlInput = trimmedUrl.length > 0;

  const normalizedUrl = useMemo(
    () => (hasUrlInput ? normalizeUrl(trimmedUrl) : null),
    [hasUrlInput, trimmedUrl]
  );
  const urlIsValid = !hasUrlInput || normalizedUrl !== null;
  const contentField = CONTENT_FIELD[type] ?? DEFAULT_CONTENT_FIELD;

  const typeSearch = useMemo(
    () => searchItemTypes(typeQuery, items),
    [typeQuery, items]
  );
  const trimmedTypeQuery = typeQuery.trim();
  const canCreateType = trimmedTypeQuery.length > 0 && !typeSearch.exactMatch;

  const validationMessage = useMemo(() => {
    if (!urlIsValid) {
      return 'Enter a valid web address, e.g. example.com';
    }
    if (!hasUrlInput && (trimmedTitle.length === 0 || trimmedContent.length === 0)) {
      return 'Title and content are required.';
    }
    return null;
  }, [urlIsValid, hasUrlInput, trimmedTitle, trimmedContent]);

  const isValid = validationMessage === null;

  function openTypePicker() {
    setTypeQuery('');
    setTypePickerVisible(true);
  }

  function closeTypePicker() {
    Keyboard.dismiss();
    setTypePickerVisible(false);
    setTypeQuery('');
  }

  function selectBuiltInType(value: ItemType) {
    setType(value);
    setCustomTypeLabel('');
    closeTypePicker();
  }

  function selectCustomType(label: string) {
    setType('other');
    setCustomTypeLabel(label);
    closeTypePicker();
  }

  function createCustomType() {
    if (!canCreateType) {
      return;
    }
    setType('other');
    setCustomTypeLabel(trimmedTypeQuery);
    closeTypePicker();
  }

  function resetForm() {
    setType('idea');
    setCustomTypeLabel('');
    setTitle('');
    setContent('');
    setSourceUrlInput('');
    setCategory('');
    setTagsInput('');
  }

  function handleSave() {
    if (!isValid) {
      return;
    }

    const now = new Date().toISOString();
    const tags = parseTagsInput(tagsInput);
    const resolvedCategory = category.trim() || undefined;

    const newItem: Item = {
      id: generateLocalId('item'),
      title: trimmedTitle || normalizedUrl || '',
      type,
      customTypeLabel: type === 'other' ? customTypeLabel.trim() : undefined,
      category: resolvedCategory,
      createdAt: now,
      updatedAt: now,
      captureType: normalizedUrl ? 'url' : 'manual',
      sourceUrl: normalizedUrl ?? undefined,
      originalText: trimmedContent || undefined,
      tags,
    };

    addItem(newItem);
    resetForm();
    navigation.goBack();
  }

  return (
    <>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        bottomOffset={24}
      >
        <View style={styles.field}>
          <Text style={styles.label}>Type</Text>
          <Pressable style={styles.selector} onPress={openTypePicker}>
            <Text style={styles.selectorText}>
              {getItemTypeLabel({ type, captureType: 'manual', customTypeLabel })}
            </Text>
            <Text style={styles.selectorChevron}>⌄</Text>
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Give this a name"
            placeholderTextColor="#9A9A9A"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{contentField.label}</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={content}
            onChangeText={setContent}
            placeholder={contentField.placeholder}
            placeholderTextColor="#9A9A9A"
            multiline
            textAlignVertical="top"
          />
        </View>

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

        <View style={styles.field}>
          <Text style={styles.label}>Source URL (optional)</Text>
          <TextInput
            style={styles.input}
            value={sourceUrlInput}
            onChangeText={setSourceUrlInput}
            placeholder="example.com"
            placeholderTextColor="#9A9A9A"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        <Pressable
          style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!isValid}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>

        {validationMessage ? (
          <Text style={styles.hint}>{validationMessage}</Text>
        ) : null}
      </KeyboardAwareScrollView>

      <Modal
        visible={typePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={closeTypePicker}
      >
        <Pressable style={styles.modalOverlay} onPress={closeTypePicker}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardAvoider}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              <Text style={styles.modalTitle}>What is this?</Text>

              <TextInput
                style={styles.searchInput}
                value={typeQuery}
                onChangeText={setTypeQuery}
                placeholder="Search or create a type"
                placeholderTextColor="#9A9A9A"
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
              />

              <ScrollView
                style={styles.modalList}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
              >
                {typeSearch.builtIns.map((option) => {
                  const selected = type === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      style={styles.modalRow}
                      onPress={() => selectBuiltInType(option.value)}
                    >
                      <Text
                        style={[
                          styles.modalRowText,
                          selected && styles.modalRowTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {selected ? <Text style={styles.modalRowCheck}>✓</Text> : null}
                    </Pressable>
                  );
                })}

                {typeSearch.customLabels.map((label) => {
                  const selected =
                    type === 'other' &&
                    normalizeTypeKey(customTypeLabel) === normalizeTypeKey(label);
                  return (
                    <Pressable
                      key={`custom-${label}`}
                      style={styles.modalRow}
                      onPress={() => selectCustomType(label)}
                    >
                      <Text
                        style={[
                          styles.modalRowText,
                          selected && styles.modalRowTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                      {selected ? <Text style={styles.modalRowCheck}>✓</Text> : null}
                    </Pressable>
                  );
                })}

                {canCreateType ? (
                  <Pressable style={styles.modalRow} onPress={createCustomType}>
                    <Text style={styles.modalCreateText}>
                      + Create "{trimmedTypeQuery}"
                    </Text>
                  </Pressable>
                ) : null}
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </>
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
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  selectorChevron: {
    fontSize: 16,
    color: '#9A9A9A',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  // maxHeight lives here rather than on modalSheet: this is the direct
  // child of modalOverlay (which has a definite flex:1 height), so the
  // percentage resolves correctly. modalSheet is an auto-sized child of
  // this view and would not resolve a percentage height on its own.
  modalKeyboardAvoider: {
    width: '100%',
    maxHeight: '75%',
  },
  modalSheet: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9A9A9A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  modalList: {
    marginTop: 4,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  modalRowText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  modalRowTextSelected: {
    fontWeight: '600',
  },
  modalRowCheck: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  modalCreateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});
