import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Button from '../components/Button';
import ItemCard from '../components/ItemCard';
import type { RootStackParamList } from '../navigation/types';
import { useItems } from '../state/ItemsContext';
import { colors, radii, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Library'>;

export default function HomeScreen({ navigation }: Props) {
  const { items, isLoading, error, refresh } = useItems();
  const year = new Date().getFullYear();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Personal Archive · Vol. I · {year}</Text>
          <Text style={styles.logoLine}>Common</Text>
          <Text style={[styles.logoLine, styles.logoAccentLine]}>
            place<Text style={styles.logoDot}> ●</Text>
          </Text>
          <Text style={styles.subtitle}>Everything worth remembering.</Text>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search your memory"
            placeholderTextColor={colors.inkFaint}
            editable={false}
          />
          <Button
            label="+ Add"
            onPress={() => navigation.navigate('AddItem')}
            style={styles.addButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isLoading || error
              ? 'Recently saved'
              : `Recently saved — ${items.length} ${
                  items.length === 1 ? 'item' : 'items'
                }`}
          </Text>
          {isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={colors.ink} />
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
          ) : (
            <>
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onPress={() =>
                    navigation.navigate('ItemDetail', { itemId: item.id })
                  }
                />
              ))}
              <View style={styles.endDivider}>
                <View style={styles.endLine} />
                <Text style={styles.endText}>✦ End ✦</Text>
                <View style={styles.endLine} />
              </View>
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
    backgroundColor: colors.paper,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  eyebrow: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  logoLine: {
    ...typography.displayXL,
    lineHeight: 38,
  },
  logoAccentLine: {
    color: colors.tomato,
  },
  logoDot: {
    color: colors.mustard,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.inkMuted,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchBar: {
    flex: 1,
    backgroundColor: colors.paperElevated,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.ink,
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
    borderColor: colors.hairline,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.inkFaint,
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
    backgroundColor: colors.hairlineStrong,
  },
  endText: {
    ...typography.caption,
    letterSpacing: 0.6,
  },
});
