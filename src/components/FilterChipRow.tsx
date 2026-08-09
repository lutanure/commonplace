import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import {
  colors,
  getCustomTypeColor,
  getItemTypeColor,
  radii,
  spacing,
  typography,
} from '../theme';
import {
  isSameTypeFilter,
  type TypeFilter,
  type TypeFilterOption,
} from '../utils/typeTaxonomy';

interface ChipColors {
  background: string;
  text: string;
}

// "All" reads as ink/cream (the app's default emphasis color, not tied to
// any type); a custom-type chip gets its deterministic hash-based color
// (see getCustomTypeColor) so the same custom type reads the same color
// here as it does on its cards and detail page.
function getChipColors(filter: TypeFilter | null): ChipColors {
  if (!filter) {
    return { background: colors.ink, text: colors.cream };
  }
  if (filter.kind === 'builtin') {
    return getItemTypeColor(filter.value);
  }
  return getCustomTypeColor(filter.label);
}

function Chip({
  label,
  active,
  colors: chipColors,
  onPress,
  testID,
}: {
  label: string;
  active: boolean;
  colors: ChipColors;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      style={({ pressed }) => [
        styles.chip,
        active && {
          backgroundColor: chipColors.background,
          borderColor: chipColors.background,
        },
        pressed && styles.chipPressed,
      ]}
      onPress={onPress}
    >
      <Text
        style={[styles.label, active && { color: chipColors.text }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Horizontally scrollable "browse by type" row: "All" plus one chip per
// built-in type and distinct custom label actually present in the
// library (see getAvailableTypeFilters) — single-select, tapping the
// active chip (or "All") clears the type filter.
export default function FilterChipRow({
  filters,
  activeFilter,
  onSelect,
}: {
  filters: TypeFilterOption[];
  activeFilter: TypeFilter | null;
  onSelect: (filter: TypeFilter | null) => void;
}) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.row}
    >
      <Chip
        label="All"
        active={activeFilter === null}
        colors={getChipColors(null)}
        onPress={() => onSelect(null)}
        testID="filter-chip-all"
      />
      {filters.map((option) => {
        const active = isSameTypeFilter(activeFilter, option.filter);
        return (
          <Chip
            key={option.key}
            label={option.label}
            active={active}
            colors={getChipColors(option.filter)}
            onPress={() => onSelect(active ? null : option.filter)}
            testID={`filter-chip-${option.key}`}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  chip: {
    backgroundColor: colors.paperElevated,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
  },
  chipPressed: {
    opacity: 0.7,
  },
  label: {
    ...typography.label,
    color: colors.inkMuted,
  },
});
