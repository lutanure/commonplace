import type { Tag } from '../models';
import { generateLocalId } from './id';

// Splits comma-separated tag input into Tag objects, trimming whitespace
// and dropping duplicates (case-insensitive) and empty entries.
export function parseTagsInput(input: string): Tag[] {
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
    tags.push({ id: generateLocalId('tag'), name });
  }

  return tags;
}
