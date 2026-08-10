import type { Item, ItemType } from '../models';
import {
  getDistinctCustomTypeLabels,
  isSameTypeFilter,
  normalizeTypeKey,
  SELECTABLE_BUILT_IN_TYPES,
  type TypeFilter,
} from './typeTaxonomy';

export const MIN_QUICK_ADD_OPTIONS = 3;
export const MAX_QUICK_ADD_OPTIONS = 5;

// A sensible, deliberately varied starting set for a user who hasn't
// customized Quick Add yet — also the first pool sanitizeQuickAddOptions
// backfills from if too many stored entries turn out to be invalid.
const DEFAULT_BUILT_IN_TYPES: ItemType[] = ['idea', 'note', 'book', 'movie'];

export const DEFAULT_QUICK_ADD_OPTIONS: TypeFilter[] =
  DEFAULT_BUILT_IN_TYPES.map((value): TypeFilter => ({
    kind: 'builtin',
    value,
  }));

function isWellFormedTypeFilter(value: unknown): value is TypeFilter {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  if (candidate.kind === 'builtin') {
    return typeof candidate.value === 'string';
  }
  if (candidate.kind === 'custom') {
    return (
      typeof candidate.label === 'string' && candidate.label.trim().length > 0
    );
  }
  return false;
}

// Cleans up a persisted (or otherwise untrusted) Quick Add option list
// against the current items and the user's built-in type visibility
// preference: drops malformed entries, drops references to a built-in type
// that no longer exists OR has been disabled in Manage Types, drops
// references to a custom label no item uses anymore, de-dupes, clamps to
// the max, and backfills from the defaults if fewer than the minimum
// survive. Always returns a valid, ready-to-persist list — callers don't
// need their own fallback logic.
export function sanitizeQuickAddOptions(
  stored: unknown,
  items: Item[],
  disabledBuiltInTypes: ItemType[] = []
): TypeFilter[] {
  const input = Array.isArray(stored) ? stored : [];
  const disabledSet = new Set(disabledBuiltInTypes);
  const isBuiltInAvailable = (value: ItemType) =>
    SELECTABLE_BUILT_IN_TYPES.has(value) && !disabledSet.has(value);
  const validCustomLabelKeys = new Set(
    getDistinctCustomTypeLabels(items).map(normalizeTypeKey)
  );

  const seenKeys = new Set<string>();
  const sanitized: TypeFilter[] = [];

  for (const entry of input) {
    if (sanitized.length >= MAX_QUICK_ADD_OPTIONS) {
      break;
    }
    if (!isWellFormedTypeFilter(entry)) {
      continue;
    }

    if (entry.kind === 'builtin') {
      if (!isBuiltInAvailable(entry.value)) {
        continue;
      }
      const key = `builtin:${entry.value}`;
      if (seenKeys.has(key)) {
        continue;
      }
      seenKeys.add(key);
      sanitized.push(entry);
    } else {
      const labelKey = normalizeTypeKey(entry.label);
      if (!validCustomLabelKeys.has(labelKey)) {
        continue;
      }
      const key = `custom:${labelKey}`;
      if (seenKeys.has(key)) {
        continue;
      }
      seenKeys.add(key);
      sanitized.push(entry);
    }
  }

  // Backfill only enough defaults to reach the minimum — a user's surviving
  // selections (in their original order) are never displaced by defaults
  // they didn't choose. A fresh install with nothing stored at all still
  // gets the full curated DEFAULT_QUICK_ADD_OPTIONS, but that happens
  // upstream in QuickAddPreferencesContext (which uses the constant
  // directly before ever calling this function) — this backfill only
  // exists to patch a partially-valid list back up to a usable size.
  //
  // Tier 1: the curated defaults (skipping any that are disabled). Tier 2:
  // any other enabled built-in type, in catalogue order — a fallback for
  // the edge case where the user has disabled enough of the curated
  // defaults that tier 1 alone can't reach the minimum.
  for (const value of DEFAULT_BUILT_IN_TYPES) {
    if (sanitized.length >= MIN_QUICK_ADD_OPTIONS) {
      break;
    }
    if (!isBuiltInAvailable(value)) {
      continue;
    }
    const key = `builtin:${value}`;
    if (seenKeys.has(key)) {
      continue;
    }
    seenKeys.add(key);
    sanitized.push({ kind: 'builtin', value });
  }

  if (sanitized.length < MIN_QUICK_ADD_OPTIONS) {
    for (const value of SELECTABLE_BUILT_IN_TYPES) {
      if (sanitized.length >= MIN_QUICK_ADD_OPTIONS) {
        break;
      }
      if (!isBuiltInAvailable(value)) {
        continue;
      }
      const key = `builtin:${value}`;
      if (seenKeys.has(key)) {
        continue;
      }
      seenKeys.add(key);
      sanitized.push({ kind: 'builtin', value });
    }
  }

  return sanitized;
}

// Whether sanitizing `stored` against `items` would change anything —
// callers use this to decide whether a corrected list needs to be
// re-persisted, without duplicating sanitizeQuickAddOptions' own logic.
export function quickAddOptionsNeedSanitizing(
  stored: unknown,
  items: Item[],
  disabledBuiltInTypes: ItemType[] = []
): boolean {
  const sanitized = sanitizeQuickAddOptions(
    stored,
    items,
    disabledBuiltInTypes
  );
  const input = Array.isArray(stored) ? stored : [];
  if (sanitized.length !== input.length) {
    return true;
  }
  return sanitized.some(
    (option, index) => !isSameTypeFilter(option, input[index] as TypeFilter)
  );
}
