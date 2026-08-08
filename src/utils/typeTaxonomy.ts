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

// A structured filter value rather than a raw label string, so a built-in
// type and a custom label can never be ambiguous with each other (e.g. a
// custom type literally named "Book" vs the built-in `book`). `null` (used
// by callers, not part of this union) represents "no filter" / "All".
export type TypeFilter =
  { kind: 'builtin'; value: ItemType } | { kind: 'custom'; label: string };

export interface TypeFilterOption {
  key: string;
  label: string;
  filter: TypeFilter;
}

// Distinct built-in types (excluding 'other', the custom-type escape
// hatch) actually present in the given items, in the same canonical order
// as ITEM_TYPE_OPTIONS — used to build "browse by type" chips without
// showing types nothing has been saved as yet.
export function getDistinctBuiltInTypes(items: Item[]): ItemType[] {
  const present = new Set(items.map((item) => item.type));
  return SELECTABLE_BUILT_INS.map((option) => option.value).filter((value) =>
    present.has(value)
  );
}

// The full set of type-filter chips a "browse by type" UI should offer for
// the given items: one per built-in type in use, then one per distinct
// custom label in use (via getDistinctCustomTypeLabels).
export function getAvailableTypeFilters(items: Item[]): TypeFilterOption[] {
  const builtInLabels = new Map(
    ITEM_TYPE_OPTIONS.map((option) => [option.value, option.label])
  );

  const builtIns: TypeFilterOption[] = getDistinctBuiltInTypes(items).map(
    (value) => ({
      key: `builtin:${value}`,
      label: builtInLabels.get(value) ?? value,
      filter: { kind: 'builtin', value },
    })
  );

  const customs: TypeFilterOption[] = getDistinctCustomTypeLabels(items).map(
    (label) => ({
      key: `custom:${normalizeTypeKey(label)}`,
      label,
      filter: { kind: 'custom', label },
    })
  );

  return [...builtIns, ...customs];
}

// Whether an item belongs to the given type filter. `filter: null` (no
// active filter) matches everything.
export function itemMatchesTypeFilter(
  item: Item,
  filter: TypeFilter | null
): boolean {
  if (!filter) {
    return true;
  }
  if (filter.kind === 'builtin') {
    return item.type === filter.value;
  }
  return (
    item.type === 'other' &&
    normalizeTypeKey(item.customTypeLabel ?? '') ===
      normalizeTypeKey(filter.label)
  );
}

// Structural equality for TypeFilter values (custom labels compared
// case-insensitively, matching getDistinctCustomTypeLabels' own dedup
// rule) — used to determine which chip, if any, is currently active.
export function isSameTypeFilter(
  a: TypeFilter | null,
  b: TypeFilter | null
): boolean {
  if (!a || !b) {
    return a === b;
  }
  if (a.kind === 'builtin' && b.kind === 'builtin') {
    return a.value === b.value;
  }
  if (a.kind === 'custom' && b.kind === 'custom') {
    return normalizeTypeKey(a.label) === normalizeTypeKey(b.label);
  }
  return false;
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
