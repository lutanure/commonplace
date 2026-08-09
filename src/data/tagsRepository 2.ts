import { supabase } from '../lib/supabaseClient';
import type { Tag } from '../models';
import { toTag, type TagRow } from './mappers';

// Resolves a batch of tag names to their canonical rows, creating any that
// don't exist yet — via the `resolve_tags` RPC rather than a plain
// `.upsert()`, which would either silently overwrite an existing tag's
// stored capitalization (merge-duplicates upsert) or fail to return the
// pre-existing row at all (`ignoreDuplicates: true`). See
// supabase/migrations/0001_init.sql for the function itself.
//
// Reorders the result to match the order names were given in — the RPC's
// `RETURNING` order isn't guaranteed to match input order, and callers
// generally want tags displayed in the order the user typed them.
export async function resolveTags(names: string[]): Promise<Tag[]> {
  if (names.length === 0) {
    return [];
  }

  const { data, error } = await supabase.rpc('resolve_tags', {
    p_names: names,
  });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as TagRow[];
  const byKey = new Map(
    rows.map((row) => [row.name.trim().toLowerCase(), toTag(row)])
  );

  const seen = new Set<string>();
  const ordered: Tag[] = [];
  for (const name of names) {
    const key = name.trim().toLowerCase();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    const tag = byKey.get(key);
    if (tag) {
      ordered.push(tag);
    }
  }
  return ordered;
}
