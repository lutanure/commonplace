import type { Item, ItemType } from '../models';
import { ITEM_TYPE_OPTIONS } from './itemTypeLabel';

// The built-in type list minus 'other' — 'other' is how a custom type is
// represented internally, not something a user picks directly.
const SELECTABLE_BUILT_INS = ITEM_TYPE_OPTIONS.filter(
  (option) => option.value !== 'other'
);

// Case-insensitive comparison key for a type name/label.
export function normalizeTypeKey(value: string): string {
  return value.trim().toLowerCase();
}

// Distinct custom type labels already used across the given items,
// de-duplicated case-insensitively ("Research Paper" and "research paper"
// count as the same type). The first-seen item's capitalization is kept
// as the canonical display label.
export function getDistinctCustomTypeLabels(items: Item[]): string[] {
  const seen = new Map<string, string>();

  for (const item of items) {
    if (item.type !== 'other') {
      continue;
    }
    const label = item.customTypeLabel?.trim();
    if (!label) {
      continue;
    }
    const key = normalizeTypeKey(label);
    if (!seen.has(key)) {
      seen.set(key, label);
    }
  }

  return Array.from(seen.values());
}

export interface TypeSearchResult {
  builtIns: { value: ItemType; label: string }[];
  customLabels: string[];
  // Whether the trimmed query is an exact (case-insensitive) match for an
  // existing built-in or custom type — when true, "+ Create" should not
  // be offered, since the type already exists.
  exactMatch: boolean;
}

// Searches built-in types and previously-used custom labels by a simple
// case-insensitive substring match. An empty query returns everything.
export function searchItemTypes(
  query: string,
  items: Item[]
): TypeSearchResult {
  const queryKey = normalizeTypeKey(query);
  const customLabels = getDistinctCustomTypeLabels(items);

  const builtIns = queryKey
    ? SELECTABLE_BUILT_INS.filter((option) =>
        option.label.toLowerCase().includes(queryKey)
      )
    : SELECTABLE_BUILT_INS;

  const filteredCustomLabels = queryKey
    ? customLabels.filter((label) => label.toLowerCase().includes(queryKey))
    : customLabels;

  const exactMatch =
    queryKey.length > 0 &&
    (SELECTABLE_BUILT_INS.some(
      (option) => normalizeTypeKey(option.label) === queryKey
    ) ||
      customLabels.some((label) => normalizeTypeKey(label) === queryKey));

  return { builtIns, customLabels: filteredCustomLabels, exactMatch };
}
