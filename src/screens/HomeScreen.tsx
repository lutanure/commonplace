import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Button from '../components/Button';
import FilterChipRow from '../components/FilterChipRow';
import ItemCard from '../components/ItemCard';
import SettingsIcon from '../components/SettingsIcon';
import type { RootStackParamList } from '../navigation/types';
import { useItems } from '../state/ItemsContext';
import { useLibrarySearch } from '../state/useLibrarySearch';
import { colors, radii, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Library'>;

export default function HomeScreen({ navigation }: Props) {
  const { items, isLoading, error, refresh } = useItems();
  const {
    query,
    setQuery,
    activeTypeFilter,
    setActiveTypeFilter,
    availableTypeFilters,
    visibleItems,
    hasActiveFilters,
    isLibraryCapped,
    clearFilters,
  } = useLibrarySearch(items);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.header}>
          <Text style={styles.logoLine}>
            Common
            <Text style={styles.logoAccentLine}>place</Text>
            <Text style={styles.logoDot}> ●</Text>
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            hitSlop={8}
            onPress={() => navigation.navigate('Settings')}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.settingsButtonPressed,
            ]}
          >
            <SettingsIcon size={16} color={colors.accent} />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <TextInput
              style={styles.searchBar}
              placeholder="Search your memory"
              placeholderTextColor={colors.textFaint}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              clearButtonMode="never"
            />
            {query.length > 0 ? (
              <Pressable
                accessibilityLabel="Clear search"
                onPress={() => setQuery('')}
                style={styles.clearButton}
                hitSlop={8}
              >
                <Text style={styles.clearButtonText}>×</Text>
              </Pressable>
            ) : null}
          </View>
          <Button
            label="+ Add"
            onPress={() => navigation.navigate('AddItem')}
            style={styles.addButton}
          />
        </View>

        {!isLoading && !error && availableTypeFilters.length > 0 ? (
          <FilterChipRow
            filters={availableTypeFilters}
            activeFilter={activeTypeFilter}
            onSelect={setActiveTypeFilter}
          />
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isLoading || error
              ? 'Recently saved'
              : hasActiveFilters
                ? `${visibleItems.length} ${
                    visibleItems.length === 1 ? 'result' : 'results'
                  }`
                : isLibraryCapped
                  ? 'Recently saved'
                  : `Recently saved — ${items.length} ${
                      items.length === 1 ? 'item' : 'items'
                    }`}
          </Text>
          {isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={colors.textPrimary} />
            </View>
          ) : error ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Could not load your library.
              </Text>
              <Button
                label="Retry"
                variant="neutral"
                onPress={() => refresh()}
                style={styles.retryButton}
              />
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nothing saved yet.</Text>
            </View>
          ) : visibleItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {query.trim()
                  ? `No matches for “${query.trim()}”.`
                  : 'No items match this filter.'}
              </Text>
              <Button
                label="Clear filters"
                variant="neutral"
                onPress={clearFilters}
                style={styles.retryButton}
              />
            </View>
          ) : (
            <>
              {visibleItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onPress={() =>
                    navigation.navigate('ItemDetail', { itemId: item.id })
                  }
                />
              ))}
              {isLibraryCapped ? null : (
                <View style={styles.endDivider}>
                  <View style={styles.endLine} />
                  <Text style={styles.endText}>✦ End ✦</Text>
                  <View style={styles.endLine} />
                </View>
              )}
            </>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsButtonPressed: {
    backgroundColor: colors.surfaceSunken,
  },
  logoLine: {
    ...typography.displayXL,
    lineHeight: 38,
  },
  // Plum carries the app's strongest brand identity; the dot gets a small
  // pop of the rust action accent — together the wordmark's one deliberate
  // Bowlby One + full core-palette moment in the app.
  logoAccentLine: {
    color: colors.primary,
  },
  logoDot: {
    color: colors.accent,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchInputWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  searchBar: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md + 2,
    paddingRight: spacing.xl + spacing.sm,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.textPrimary,
  },
  clearButton: {
    position: 'absolute',
    right: spacing.sm + 2,
    height: 22,
    width: 22,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSunken,
  },
  clearButtonText: {
    fontSize: 15,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  addButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  section: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    marginBottom: spacing.md,
  },
  emptyState: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.textFaint,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  endDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  endLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
  },
  endText: {
    ...typography.caption,
    letterSpacing: 0.6,
  },
});
