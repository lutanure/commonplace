import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ItemType } from '../models';

// Local-only, like Quick Add preferences — which built-in types are hidden
// from selection is a per-device UI preference, not something that needs
// cloud sync yet.
const STORAGE_KEY = 'commonplace:disabledBuiltInTypes:v1';

// Returns the raw parsed value (or null), deliberately unsanitized —
// validating it is the caller's job (see utils/typeVisibility).
export async function loadDisabledBuiltInTypes(): Promise<unknown> {
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

export async function saveDisabledBuiltInTypes(
  types: ItemType[]
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(types));
}
