import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BackControl from '../components/BackControl';
import Button from '../components/Button';
import type { RootStackParamList } from '../navigation/types';
import { useBuiltInTypePreferences } from '../state/BuiltInTypePreferencesContext';
import { useItems } from '../state/ItemsContext';
import { useQuickAddPreferences } from '../state/QuickAddPreferencesContext';
import { colors, fontFamily, radii, spacing, typography } from '../theme';
import { getCustomTypeColor, getItemTypeColor } from '../theme/itemTypeColors';
import {
  MAX_QUICK_ADD_OPTIONS,
  MIN_QUICK_ADD_OPTIONS,
} from '../utils/quickAddOptions';
import {
  getDistinctCustomTypeLabels,
  isSameTypeFilter,
  normalizeTypeKey,
  SELECTABLE_BUILT_INS,
  type TypeFilter,
  type TypeFilterOption,
} from '../utils/typeTaxonomy';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomizeQuickAdd'>;

// Every built-in type, regardless of the enabled/disabled preference — used
// to resolve a label for an already-selected type even if it has since been
// disabled elsewhere. The "All types" candidate list below is filtered
// separately, since disabled types shouldn't be offered for *new* selection.
const ALL_BUILT_IN_OPTIONS: TypeFilterOption[] = SELECTABLE_BUILT_INS.map(
  (option) => ({
    key: `builtin:${option.value}`,
    label: option.label,
    filter: { kind: 'builtin', value: option.value },
  })
);

function getDotColor(filter: TypeFilter): string {
  return filter.kind === 'builtin'
    ? getItemTypeColor(filter.value).background
    : getCustomTypeColor(filter.label).background;
}

export default function CustomizeQuickAddScreen({ navigation }: Props) {
  const { items } = useItems();
  const { isTypeEnabled } = useBuiltInTypePreferences();
  const {
    options: savedOptions,
    isLoading: preferencesLoading,
    setOptions,
  } = useQuickAddPreferences();

  const [selected, setSelected] = useState<TypeFilter[]>(savedOptions);
  const [isSaving, setIsSaving] = useState(false);

  // Adopt the persisted preference once it's loaded, so a slow AsyncStorage
  // read doesn't leave this screen editing a stale default list.
  useEffect(() => {
    if (!preferencesLoading) {
      setSelected(savedOptions);
    }
    // Deliberately only re-syncs when the load finishes, not on every
    // savedOptions change — otherwise a background re-sanitize (e.g. from a
    // custom type being deleted elsewhere) would blow away in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferencesLoading]);

  // Disabled built-in types aren't offered for new Quick Add selection —
  // an already-selected one is still resolvable via ALL_BUILT_IN_OPTIONS
  // above, and gets dropped by QuickAddPreferencesContext's own sanitize
  // pass shortly after being disabled.
  const builtInCandidates = ALL_BUILT_IN_OPTIONS.filter(
    (option) =>
      option.filter.kind === 'builtin' && isTypeEnabled(option.filter.value)
  );
  const customCandidates: TypeFilterOption[] = getDistinctCustomTypeLabels(
    items
  ).map((label) => ({
    key: `custom:${normalizeTypeKey(label)}`,
    label,
    filter: { kind: 'custom', label },
  }));
  const candidates = [...builtInCandidates, ...customCandidates];

  const atMax = selected.length >= MAX_QUICK_ADD_OPTIONS;
  const belowMin = selected.length < MIN_QUICK_ADD_OPTIONS;

  function isSelected(filter: TypeFilter): boolean {
    return selected.some((option) => isSameTypeFilter(option, filter));
  }

  function toggle(filter: TypeFilter) {
    if (isSelected(filter)) {
      setSelected((current) =>
        current.filter((option) => !isSameTypeFilter(option, filter))
      );
      return;
    }
    if (atMax) {
      return;
    }
    setSelected((current) => [...current, filter]);
  }

  function move(index: number, direction: -1 | 1) {
    setSelected((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) {
        return current;
      }
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSave() {
    if (belowMin || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await setOptions(selected);
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Couldn't save Quick Add",
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackControl label="Settings" onPress={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Customize Quick Add</Text>
        <Text style={styles.intro}>
          Choose {MIN_QUICK_ADD_OPTIONS}–{MAX_QUICK_ADD_OPTIONS} types to
          surface as fast capture shortcuts.
        </Text>

        <Text style={styles.sectionHeader}>
          Selected ({selected.length}/{MAX_QUICK_ADD_OPTIONS})
        </Text>
        {selected.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nothing selected yet — pick from the list below.
            </Text>
          </View>
        ) : (
          <View style={styles.group}>
            {selected.map((filter, index) => {
              const label =
                filter.kind === 'builtin'
                  ? (ALL_BUILT_IN_OPTIONS.find((c) =>
                      isSameTypeFilter(c.filter, filter)
                    )?.label ?? filter.value)
                  : filter.label;
              return (
                <View key={`${filter.kind}-${index}`}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: getDotColor(filter) },
                        ]}
                      />
                      <Text style={styles.rowLabel}>{label}</Text>
                    </View>
                    <View style={styles.reorderControls}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Move ${label} up`}
                        hitSlop={8}
                        disabled={index === 0}
                        onPress={() => move(index, -1)}
                        style={styles.reorderButton}
                      >
                        <Text
                          style={[
                            styles.reorderIcon,
                            index === 0 && styles.reorderIconDisabled,
                          ]}
                        >
                          ↑
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Move ${label} down`}
                        hitSlop={8}
                        disabled={index === selected.length - 1}
                        onPress={() => move(index, 1)}
                        style={styles.reorderButton}
                      >
                        <Text
                          style={[
                            styles.reorderIcon,
                            index === selected.length - 1 &&
                              styles.reorderIconDisabled,
                          ]}
                        >
                          ↓
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${label} from Quick Add`}
                        hitSlop={8}
                        onPress={() => toggle(filter)}
                        style={styles.reorderButton}
                      >
                        <Text style={styles.removeIcon}>×</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.sectionHeader}>All types</Text>
        <View style={styles.group}>
          {candidates.map((candidate, index) => {
            const selectedHere = isSelected(candidate.filter);
            const disabled = !selectedHere && atMax;
            return (
              <View key={candidate.key}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <Pressable
                  onPress={() => toggle(candidate.filter)}
                  disabled={disabled}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: getDotColor(candidate.filter) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.rowLabel,
                        disabled && styles.rowLabelDisabled,
                      ]}
                    >
                      {candidate.label}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.checkbox,
                      selectedHere && styles.checkboxChecked,
                    ]}
                  >
                    {selectedHere ? '✓' : ''}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <Button
          label={isSaving ? 'Saving…' : 'Save Quick Add'}
          onPress={handleSave}
          disabled={belowMin || isSaving}
          style={styles.saveButton}
        />
        {belowMin ? (
          <Text style={styles.hint}>
            Choose at least {MIN_QUICK_ADD_OPTIONS} types.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.displayLG,
    marginTop: spacing.sm,
  },
  intro: {
    ...typography.bodyMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    ...typography.label,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSunken,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexShrink: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
  },
  rowLabel: {
    ...typography.body,
    flexShrink: 1,
  },
  rowLabelDisabled: {
    color: colors.textFaint,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 18,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    textAlign: 'center',
    lineHeight: 20,
    color: colors.cream,
    overflow: 'hidden',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    fontFamily: fontFamily.bodyBold,
  },
  reorderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reorderButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderIcon: {
    fontSize: 16,
    fontFamily: fontFamily.bodyBold,
    color: colors.textSecondary,
  },
  reorderIconDisabled: {
    color: colors.textFaint,
  },
  removeIcon: {
    fontSize: 18,
    color: colors.danger,
  },
  emptyState: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    ...typography.bodyMuted,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: spacing.xl,
  },
  hint: {
    ...typography.caption,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
