import type { Tag } from './tag';

// What the saved information *is*, independent of how it entered the app.
// 'other' is the deliberate escape hatch for anything not covered by the
// built-in list — paired with `customTypeLabel` below.
// Kept in sync by hand with the `items_type_check` constraint in
// supabase/migrations/0001_init.sql — this union is the source of truth,
// the DB constraint is a backstop.
export type ItemType =
  | 'idea'
  | 'note'
  | 'article'
  | 'book'
  | 'movie'
  | 'tv_show'
  | 'song'
  | 'podcast'
  | 'product'
  | 'place'
  | 'recipe'
  | 'quote'
  | 'image'
  | 'other';

// Deliberately a plain string, not an enum — categories may be AI-generated
// or user-defined and shouldn't be constrained to a fixed set.
export type ItemCategory = string;

// How the item entered Commonplace, independent of what it's about. Kept in
// sync by hand with `items_capture_type_check` in
// supabase/migrations/0001_init.sql.
export type CaptureType = 'screenshot' | 'url' | 'manual' | 'image' | 'text';

// A single extracted fact, e.g. { label: 'Price', value: '$39.95' }.
// An array of these lets AI-derived info hold several distinct facts
// instead of forcing everything into one summary paragraph.
export interface RelevantFact {
  label: string;
  value: string;
}

export interface Item {
  // Identity
  id: string;
  title: string;
  type: ItemType;
  // User-defined label shown when type === 'other', e.g. 'Research Paper'.
  // Keeps ItemType a closed, analyzable set while still letting a user
  // name something it doesn't cover.
  customTypeLabel?: string;
  category?: ItemCategory;
  createdAt: string;
  updatedAt: string;

  // Source / original content
  captureType: CaptureType;
  sourceName?: string;
  sourceUrl?: string;
  mediaUri?: string;
  originalText?: string;

  // AI / interpreted information
  summary?: string;
  relevantInfo?: RelevantFact[];
  tags: Tag[];
  entities?: string[];

  // Personal context
  userNote?: string;
  whySaved?: string;
}
