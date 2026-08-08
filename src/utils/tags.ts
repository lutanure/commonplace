import type { Tag } from '../models';
import { generateLocalId } from './id';

// Splits comma-separated tag input into Tag objects, trimming whitespace
// and dropping duplicates (case-insensitive) and empty entries.
//
// `existingTags` lets a tag that matches one already on the item (by name,
// case-insensitive) keep its original id instead of minting a new one —
// this matters once tags become shared graph nodes, so editing an Item
// shouldn't silently fork "Travel" into a second, unrelated tag.
export function parseTagsInput(input: string, existingTags: Tag[] = []): Tag[] {
  const existingByKey = new Map(
    existingTags.map((tag) => [tag.name.trim().toLowerCase(), tag])
  );
  const seen = new Set<string>();
  const tags: Tag[] = [];

  for (const raw of input.split(',')) {
    const name = raw.trim();
    if (!name) {
      continue;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    const existing = existingByKey.get(key);
    tags.push({ id: existing ? existing.id : generateLocalId('tag'), name });
  }

  return tags;
}
