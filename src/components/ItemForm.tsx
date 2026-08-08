import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
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
import type { Item, ItemType, Tag } from '../models';
import { useItems } from '../state/ItemsContext';
import { colors, radii, spacing, typography } from '../theme';
import { getItemTypeColor } from '../theme/itemTypeColors';
import { getItemTypeLabel } from '../utils/itemTypeLabel';
import { parseTagsInput } from '../utils/tags';
import { normalizeTypeKey, searchItemTypes } from '../utils/typeTaxonomy';
import { normalizeUrl } from '../utils/url';
import Button from './Button';
import TypePill from './TypePill';

// Sensible per-type wording for the shared content field — not a unique
// form per type, just a friendlier label/placeholder where it's easy.
const CONTENT_FIELD: Partial<
  Record<ItemType, { label: string; placeholder: string }>
> = {
  idea: { label: 'Idea', placeholder: "What's the idea?" },
  note: { label: 'Note', placeholder: "What's on your mind?" },
  quote: { label: 'Quote', placeholder: 'The quote itself' },
};
const DEFAULT_CONTENT_FIELD = {
  label: 'Notes & content',
  placeholder: 'What do you want to remember about this?',
};

// What ItemForm hands back on submit. It only covers the fields a user is
// actually allowed to edit — AI fields (summary, relevantInfo, entities)
// and identity/bookkeeping fields (id, createdAt, updatedAt, captureType)
// are deliberately not part of this shape; each screen decides how the
// result maps onto those.
export interface ItemFormResult {
  type: ItemType;
  customTypeLabel?: string;
  title: string;
  originalText?: string;
  category?: string;
  tags: Tag[];
  sourceUrl?: string;
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export default function ItemForm({
  initialItem,
  onSubmit,
}: {
  initialItem?: Item;
  onSubmit: (result: ItemFormResult) => void;
}) {
  const { items } = useItems();

  const [type, setType] = useState<ItemType>(initialItem?.type ?? 'idea');
  const [customTypeLabel, setCustomTypeLabel] = useState(
    initialItem?.customTypeLabel ?? ''
  );
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [typeQuery, setTypeQuery] = useState('');
  const [title, setTitle] = useState(initialItem?.title ?? '');
  const [content, setContent] = useState(initialItem?.originalText ?? '');
  const [sourceUrlInput, setSourceUrlInput] = useState(
    initialItem?.sourceUrl ?? ''
  );
  const [category, setCategory] = useState(initialItem?.category ?? '');
  const [tagsInput, setTagsInput] = useState(
    initialItem ? initialItem.tags.map((tag) => tag.name).join(', ') : ''
  );

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

  const trimmedCustomTypeLabel = customTypeLabel.trim();

  const validationMessage = useMemo(() => {
    if (!urlIsValid) {
      return 'Enter a valid web address, e.g. example.com';
    }
    if (
      !hasUrlInput &&
      (trimmedTitle.length === 0 || trimmedContent.length === 0)
    ) {
      return 'Title and content are required.';
    }
    if (type === 'other' && trimmedCustomTypeLabel.length === 0) {
      return 'Choose or create a type.';
    }
    return null;
  }, [
    urlIsValid,
    hasUrlInput,
    trimmedTitle,
    trimmedContent,
    type,
    trimmedCustomTypeLabel,
  ]);

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

  function handleSave() {
    if (!isValid) {
      return;
    }

    const tags = parseTagsInput(tagsInput, initialItem?.tags ?? []);

    onSubmit({
      type,
      customTypeLabel: type === 'other' ? customTypeLabel.trim() : undefined,
      title: trimmedTitle || normalizedUrl || '',
      originalText: trimmedContent || undefined,
      category: category.trim() || undefined,
      tags,
      sourceUrl: normalizedUrl ?? undefined,
    });
  }

  return (
    <>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        bottomOffset={24}
      >
        <FormField label="What are you saving?">
          <Pressable style={styles.selector} onPress={openTypePicker}>
            <View style={styles.selectorPreview}>
              <TypePill
                item={{ type, captureType: 'manual', customTypeLabel }}
              />
              <Text style={styles.selectorText}>
                {getItemTypeLabel({
                  type,
                  captureType: 'manual',
                  customTypeLabel,
                })}
              </Text>
            </View>
            <Text style={styles.selectorChevron}>⌄</Text>
          </Pressable>
        </FormField>

        <FormField label="Title *">
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Name of the thing"
            placeholderTextColor={colors.inkFaint}
          />
        </FormField>

        <FormField label={contentField.label}>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={content}
            onChangeText={setContent}
            placeholder={contentField.placeholder}
            placeholderTextColor={colors.inkFaint}
            multiline
            textAlignVertical="top"
          />
        </FormField>

        <FormField label="Category — optional">
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. product idea, travel, work"
            placeholderTextColor={colors.inkFaint}
          />
        </FormField>

        <FormField label="Tags — optional">
          <TextInput
            style={[styles.input, styles.inputDashed]}
            value={tagsInput}
            onChangeText={setTagsInput}
            placeholder="e.g. love, film, 2024"
            placeholderTextColor={colors.inkFaint}
            autoCapitalize="none"
          />
        </FormField>

        <FormField label="Source URL — optional">
          <TextInput
            style={[styles.input, styles.inputDashed]}
            value={sourceUrlInput}
            onChangeText={setSourceUrlInput}
            placeholder="https://…"
            placeholderTextColor={colors.inkFaint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </FormField>

        <Button
          label="Save to Library"
          onPress={handleSave}
          disabled={!isValid}
          style={styles.saveButton}
        />

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
                placeholderTextColor={colors.inkFaint}
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
                  const { background } = getItemTypeColor(option.value);
                  return (
                    <Pressable
                      key={option.value}
                      style={styles.modalRow}
                      onPress={() => selectBuiltInType(option.value)}
                    >
                      <View style={styles.modalRowLeft}>
                        <View
                          style={[
                            styles.modalRowDot,
                            { backgroundColor: background },
                          ]}
                        />
                        <Text
                          style={[
                            styles.modalRowText,
                            selected && styles.modalRowTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>
                      {selected ? (
                        <Text style={styles.modalRowCheck}>✓</Text>
                      ) : null}
                    </Pressable>
                  );
                })}

                {typeSearch.customLabels.map((label) => {
                  const selected =
                    type === 'other' &&
                    normalizeTypeKey(customTypeLabel) ===
                      normalizeTypeKey(label);
                  const { background } = getItemTypeColor('other');
                  return (
                    <Pressable
                      key={`custom-${label}`}
                      style={styles.modalRow}
                      onPress={() => selectCustomType(label)}
                    >
                      <View style={styles.modalRowLeft}>
                        <View
                          style={[
                            styles.modalRowDot,
                            { backgroundColor: background },
                          ]}
                        />
                        <Text
                          style={[
                            styles.modalRowText,
                            selected && styles.modalRowTextSelected,
                          ]}
                        >
                          {label}
                        </Text>
                      </View>
                      {selected ? (
                        <Text style={styles.modalRowCheck}>✓</Text>
                      ) : null}
                    </Pressable>
                  );
                })}

                {canCreateType ? (
                  <Pressable style={styles.modalRow} onPress={createCustomType}>
                    <Text style={styles.modalCreateText}>
                      {`+ Create "${trimmedTypeQuery}"`}
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
    backgroundColor: colors.paper,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  field: {
    marginBottom: spacing.lg + 2,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.paperElevated,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.ink,
  },
  inputDashed: {
    borderStyle: 'dashed',
    borderColor: colors.inkFaint,
  },
  multilineInput: {
    minHeight: 110,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.paperElevated,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  selectorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  selectorText: {
    ...typography.displayMD,
    fontSize: 17,
  },
  selectorChevron: {
    fontSize: 18,
    color: colors.inkMuted,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  hint: {
    marginTop: spacing.md - 2,
    fontSize: 13,
    color: colors.inkFaint,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(34, 36, 46, 0.4)',
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
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  modalTitle: {
    ...typography.label,
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.paperElevated,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  modalList: {
    marginTop: spacing.xs,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  modalRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalRowDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
  },
  modalRowText: {
    fontSize: 16,
    color: colors.ink,
  },
  modalRowTextSelected: {
    fontWeight: '700',
  },
  modalRowCheck: {
    fontSize: 15,
    color: colors.tomato,
    fontWeight: '700',
  },
  modalCreateText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.tomato,
  },
});
