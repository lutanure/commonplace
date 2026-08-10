import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TypeFilter } from '../utils/typeTaxonomy';

// Local-only for now — Quick Add preferences don't need cloud sync until
// account linking exists. Kept behind this small get/set API (rather than
// called directly from state) so the storage backend can change later
// without touching callers.
const STORAGE_KEY = 'commonplace:quickAddPreferences:v1';

// Returns the raw parsed value (or null if nothing is stored / it can't be
// parsed) — deliberately unsanitized. Validating it against the current
// items list is the caller's job (see utils/quickAddOptions), since this
// module has no notion of Items.
export async function loadQuickAddPreferences(): Promise<unknown> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveQuickAddPreferences(
  options: TypeFilter[]
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(options));
}
