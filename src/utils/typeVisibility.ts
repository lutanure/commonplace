import type { ItemType } from '../models';
import { SELECTABLE_BUILT_IN_TYPES } from './typeTaxonomy';

// Validates a persisted (or otherwise untrusted) list of disabled built-in
// types: drops anything that isn't a real, currently-selectable built-in
// type ('other' is never toggleable — it's the custom-type escape hatch,
// not a built-in), and de-dupes. Mirrors the same defensive-parsing
// philosophy as sanitizeQuickAddOptions.
export function sanitizeDisabledTypes(stored: unknown): ItemType[] {
  if (!Array.isArray(stored)) {
    return [];
  }
  const seen = new Set<ItemType>();
  for (const value of stored) {
    if (
      typeof value === 'string' &&
      SELECTABLE_BUILT_IN_TYPES.has(value as ItemType)
    ) {
      seen.add(value as ItemType);
    }
  }
  return Array.from(seen);
}
