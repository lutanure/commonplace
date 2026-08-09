import type { Item } from '../models';

// Pinned items first (most-recently-pinned first), then everything else
// by recency — the same grouping the `listItems` query orders by at the
// DB level (see itemsRepository.ts), reimplemented here so client-side
// state changes (pin/unpin, optimistic add) can be re-sorted locally
// without a round trip. ISO timestamps compare correctly with a plain
// string comparison as long as they share a format, which every
// created_at/pinned_at value from Supabase does.
function compareItemsForLibrary(a: Item, b: Item): number {
  if (a.isPinned !== b.isPinned) {
    return a.isPinned ? -1 : 1;
  }
  if (a.isPinned) {
    const aPinnedAt = a.pinnedAt ?? a.createdAt;
    const bPinnedAt = b.pinnedAt ?? b.createdAt;
    return bPinnedAt.localeCompare(aPinnedAt);
  }
  return b.createdAt.localeCompare(a.createdAt);
}

export function sortItemsForLibrary(items: Item[]): Item[] {
  return [...items].sort(compareItemsForLibrary);
}
