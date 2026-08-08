import type { CaptureType, Item, ItemType, RelevantFact, Tag } from '../models';

// Shape of a row returned by `items`. `type`/`capture_type` are plain
// `text` in Postgres (see supabase/migrations/0001_init.sql) — cast to the
// TS unions here, trusting the DB CHECK constraints to have kept the value
// in range.
export interface ItemRow {
  id: string;
  user_id: string;
  title: string;
  type: string;
  custom_type_label: string | null;
  category: string | null;
  capture_type: string;
  source_name: string | null;
  source_url: string | null;
  media_uri: string | null;
  original_text: string | null;
  summary: string | null;
  relevant_info: RelevantFact[] | null;
  entities: string[] | null;
  user_note: string | null;
  why_saved: string | null;
  created_at: string;
  updated_at: string;
}

export interface TagRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

// Fields a caller may set when creating or updating an item. Deliberately
// excludes id/createdAt/updatedAt (DB-owned) and tags (linked separately
// via item_tags, not a column on `items`).
export type ItemFields = Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'tags'>;

export type NewItemInput = ItemFields & { tags: Tag[] };

export function toTag(row: TagRow): Tag {
  return { id: row.id, name: row.name };
}

export function toItem(row: ItemRow, tags: Tag[]): Item {
  return {
    id: row.id,
    title: row.title,
    type: row.type as ItemType,
    customTypeLabel: row.custom_type_label ?? undefined,
    category: row.category ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    captureType: row.capture_type as CaptureType,
    sourceName: row.source_name ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    mediaUri: row.media_uri ?? undefined,
    originalText: row.original_text ?? undefined,
    summary: row.summary ?? undefined,
    relevantInfo: row.relevant_info ?? undefined,
    tags,
    entities: row.entities ?? undefined,
    userNote: row.user_note ?? undefined,
    whySaved: row.why_saved ?? undefined,
  };
}

type ItemColumnRow = Omit<
  ItemRow,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;

// camelCase Item field -> snake_case `items` column, for every field a
// caller can set. Shared by insert (all fields) and update (only the
// fields present on the partial patch) so the mapping only lives once.
const FIELD_TO_COLUMN: Record<keyof ItemFields, keyof ItemColumnRow> = {
  title: 'title',
  type: 'type',
  customTypeLabel: 'custom_type_label',
  category: 'category',
  captureType: 'capture_type',
  sourceName: 'source_name',
  sourceUrl: 'source_url',
  mediaUri: 'media_uri',
  originalText: 'original_text',
  summary: 'summary',
  relevantInfo: 'relevant_info',
  entities: 'entities',
  userNote: 'user_note',
  whySaved: 'why_saved',
};

export function toItemInsertRow(input: NewItemInput): ItemColumnRow {
  const row = {} as ItemColumnRow;
  for (const [field, column] of Object.entries(FIELD_TO_COLUMN) as [
    keyof ItemFields,
    keyof ItemColumnRow,
  ][]) {
    (row as Record<string, unknown>)[column] = input[field] ?? null;
  }
  return row;
}

// Only maps keys actually present on `updates`, so a caller can clear a
// field to null by passing it as `undefined` while leaving every other
// field on the row untouched.
export function toItemUpdateRow(
  updates: Partial<ItemFields>
): Partial<ItemColumnRow> {
  const row: Partial<ItemColumnRow> = {};
  for (const key of Object.keys(updates) as (keyof ItemFields)[]) {
    const column = FIELD_TO_COLUMN[key];
    if (column) {
      (row as Record<string, unknown>)[column] = updates[key] ?? null;
    }
  }
  return row;
}
