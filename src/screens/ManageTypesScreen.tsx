import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import BackControl from '../components/BackControl';
import type { RootStackParamList } from '../navigation/types';
import { useBuiltInTypePreferences } from '../state/BuiltInTypePreferencesContext';
import { useItems } from '../state/ItemsContext';
import { colors, fontFamily, radii, spacing, typography } from '../theme';
import { getCustomTypeColor, getItemTypeColor } from '../theme/itemTypeColors';
import {
  getDistinctCustomTypeLabels,
  getItemsUsingCustomType,
  SELECTABLE_BUILT_INS,
} from '../utils/typeTaxonomy';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageTypes'>;

function TypeRow({
  label,
  dotColor,
  dimmed,
  trailing,
}: {
  label: string;
  dotColor: string;
  dimmed?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={[styles.rowLabel, dimmed && styles.rowLabelDimmed]}>
          {label}
        </Text>
      </View>
      {trailing}
    </View>
  );
}

export default function ManageTypesScreen({ navigation }: Props) {
  const { items, updateItem, refresh } = useItems();
  const { isTypeEnabled, setTypeEnabled } = useBuiltInTypePreferences();
  const [deletingLabel, setDeletingLabel] = useState<string | null>(null);

  const customLabels = getDistinctCustomTypeLabels(items);

  async function handleDelete(label: string) {
    const affected = getItemsUsingCustomType(items, label);

    Alert.alert(
      `Remove "${label}"?`,
      `This type is used by ${affected.length} ${
        affected.length === 1 ? 'item' : 'items'
      }. The items will not be deleted, but their type will become "Other".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            performDelete(
              label,
              affected.map((item) => item.id)
            ),
        },
      ]
    );
  }

  async function performDelete(label: string, affectedItemIds: string[]) {
    setDeletingLabel(label);
    try {
      const results = await Promise.allSettled(
        affectedItemIds.map((id) =>
          updateItem(id, { customTypeLabel: undefined })
        )
      );
      const failedCount = results.filter((r) => r.status === 'rejected').length;

      // Always resync from persisted truth, whether or not everything
      // succeeded — never leave the UI showing optimistic state that
      // doesn't match what's actually saved.
      await refresh();

      if (failedCount > 0) {
        Alert.alert(
          "Couldn't fully remove this type",
          `Only ${affectedItemIds.length - failedCount} of ${
            affectedItemIds.length
          } items were updated. Please try again.`
        );
      }
    } finally {
      setDeletingLabel(null);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackControl label="Settings" onPress={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Manage Types</Text>
        <Text style={styles.intro}>
          Your own types are created the moment you use them in Add Item, and
          can be removed here. Built-in types can&apos;t be removed, but you can
          hide ones you don&apos;t use — existing items keep their type either
          way.
        </Text>

        <Text style={styles.sectionHeader}>Your custom types</Text>
        {customLabels.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              You haven&apos;t created any custom types yet.
            </Text>
          </View>
        ) : (
          <View style={styles.group}>
            {customLabels.map((label, index) => (
              <View key={label}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <TypeRow
                  label={label}
                  dotColor={getCustomTypeColor(label).background}
                  trailing={
                    deletingLabel === label ? (
                      <ActivityIndicator color={colors.textSecondary} />
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${label}`}
                        hitSlop={8}
                        disabled={deletingLabel !== null}
                        onPress={() => handleDelete(label)}
                      >
                        <Text style={styles.deleteText}>Remove</Text>
                      </Pressable>
                    )
                  }
                />
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionHeader}>Built-in types</Text>
        <View style={styles.group}>
          {SELECTABLE_BUILT_INS.map((option, index) => {
            const enabled = isTypeEnabled(option.value);
            return (
              <View key={option.value}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <TypeRow
                  label={option.label}
                  dotColor={getItemTypeColor(option.value).background}
                  dimmed={!enabled}
                  trailing={
                    <Switch
                      accessibilityLabel={`${option.label} type`}
                      value={enabled}
                      onValueChange={(next) =>
                        setTypeEnabled(option.value, next)
                      }
                      trackColor={{
                        false: colors.border,
                        true: colors.accent,
                      }}
                      thumbColor={colors.surface}
                      ios_backgroundColor={colors.border}
                    />
                  }
                />
              </View>
            );
          })}
        </View>
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
    paddingVertical: spacing.md + 2,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
  },
  rowLabel: {
    ...typography.body,
  },
  rowLabelDimmed: {
    color: colors.textFaint,
  },
  deleteText: {
    ...typography.bodyMuted,
    fontFamily: fontFamily.bodyBold,
    color: colors.danger,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 18,
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
});
