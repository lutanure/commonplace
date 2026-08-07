import type { Tag } from './tag';

// What the saved information *is*, independent of how it entered the app.
export type ItemType =
  | 'article'
  | 'note'
  | 'idea'
  | 'product'
  | 'movie'
  | 'song'
  | 'place'
  | 'image'
  | 'other';

// Deliberately a plain string, not an enum — categories may be AI-generated
// or user-defined and shouldn't be constrained to a fixed set.
export type ItemCategory = string;

// How the item entered Commonplace, independent of what it's about.
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
