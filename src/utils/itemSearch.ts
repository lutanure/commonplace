import type { Item } from '../models';
import { getItemTypeLabel } from './itemTypeLabel';

// Case- and diacritic-insensitive comparison key: NFD-decomposes accented
// characters into a base letter + combining mark, then strips the combining
// marks, so "café" / "cafe" and "São" / "sao" compare equal without pulling
// in a normalization library.
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

// Every field a user would plausibly search by, joined into one normalized
// blob per item. `getItemTypeLabel` already resolves the built-in label,
// custom type label, or "Link" fallback, so type/customTypeLabel search
// falls out of reusing it rather than re-deriving that logic here.
function searchableFields(item: Item): (string | undefined)[] {
  return [
    item.title,
    getItemTypeLabel(item),
    item.category,
    ...item.tags.map((tag) => tag.name),
    item.originalText,
    item.userNote,
    item.summary,
    ...(item.entities ?? []),
    item.sourceName,
    item.sourceUrl,
  ];
}

export function buildSearchHaystack(item: Item): string {
  return normalizeSearchText(
    searchableFields(item)
      .filter((field): field is string => Boolean(field))
      .join(' ')
  );
}

function queryTokens(query: string): string[] {
  return normalizeSearchText(query).split(/\s+/).filter(Boolean);
}

function haystackMatchesTokens(haystack: string, tokens: string[]): boolean {
  return tokens.every((token) => haystack.includes(token));
}

// Forgiving multi-word matching: every whitespace-separated token in the
// query must appear somewhere in the item's searchable text, in any order
// ("movie dune" matches "Dune (2021) — Movie"). No fuzzy/typo-tolerance —
// that belongs to a future semantic-search layer, not this substring match.
export function itemMatchesQuery(item: Item, query: string): boolean {
  const tokens = queryTokens(query);
  return (
    tokens.length === 0 ||
    haystackMatchesTokens(buildSearchHaystack(item), tokens)
  );
}

export function filterItemsByQuery(items: Item[], query: string): Item[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) {
    return items;
  }
  return items.filter((item) =>
    haystackMatchesTokens(buildSearchHaystack(item), tokens)
  );
}
