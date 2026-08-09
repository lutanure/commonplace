import type { Item, ItemType } from '../models';
import { colors } from './colors';

export interface ItemTypeColor {
  background: string;
  text: string;
}

// Presentation only — mirrors the grouping in `getItemTypeLabel`'s domain
// but never touches it. Types are grouped into a small family of accents
// so the palette stays restrained rather than one color per type:
//  - tomato: screen entertainment (movie, tv_show)
//  - plum: audio (song, podcast)
//  - olive: print / reading (book, article... article gets navy instead,
//    see below, to match the approved mockup exactly)
//  - mustard: thought / self (idea, note)
//  - teal: place / experience (place, recipe)
//  - navy: reference / object (article, product, image)
//  - clay: the unclassified fallback (other)
const TYPE_COLORS: Record<ItemType, ItemTypeColor> = {
  idea: { background: colors.mustard, text: colors.ink },
  note: { background: colors.mustard, text: colors.ink },
  article: { background: colors.navy, text: colors.cream },
  book: { background: colors.olive, text: colors.cream },
  quote: { background: colors.olive, text: colors.cream },
  movie: { background: colors.tomato, text: colors.cream },
  tv_show: { background: colors.tomato, text: colors.cream },
  song: { background: colors.plum, text: colors.cream },
  podcast: { background: colors.plum, text: colors.cream },
  product: { background: colors.navy, text: colors.cream },
  place: { background: colors.teal, text: colors.cream },
  recipe: { background: colors.teal, text: colors.cream },
  image: { background: colors.navy, text: colors.cream },
  other: { background: colors.clay, text: colors.cream },
};

export function getItemTypeColor(type: ItemType): ItemTypeColor {
  return TYPE_COLORS[type];
}

// Deterministic palette for custom (type === 'other') labels: the same
// accent/text pairs already used for built-in types, picked by hashing
// the normalized label so a given custom type always lands on the same
// color and different labels spread across the palette. No randomness,
// and nothing persisted — see getCustomTypeColor below. `other`'s own
// `clay` fallback is deliberately excluded here so an unlabeled custom
// type (clay) never gets confused with the hashed choice for a labeled
// one, e.g. a custom type someone names "Other".
const CUSTOM_TYPE_PALETTE: ItemTypeColor[] = [
  { background: colors.tomato, text: colors.cream },
  { background: colors.olive, text: colors.cream },
  { background: colors.mustard, text: colors.ink },
  { background: colors.teal, text: colors.cream },
  { background: colors.plum, text: colors.cream },
  { background: colors.navy, text: colors.cream },
];

// A small, deterministic string hash (no runtime randomness) — good
// enough to spread labels across a handful of palette slots, not a
// cryptographic or collision-resistant hash.
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// The color for a specific custom type label — same label (compared
// case/whitespace-insensitively) always maps to the same palette entry.
export function getCustomTypeColor(label: string): ItemTypeColor {
  const key = label.trim().toLowerCase();
  if (!key) {
    return TYPE_COLORS.other;
  }
  const index = hashString(key) % CUSTOM_TYPE_PALETTE.length;
  return CUSTOM_TYPE_PALETTE[index];
}

// The color to display for a given item: a labeled custom type gets its
// deterministic hash-based color, everything else (built-ins, and an
// unlabeled 'other') gets its fixed TYPE_COLORS entry.
export function getItemDisplayColor(
  item: Pick<Item, 'type' | 'customTypeLabel'>
): ItemTypeColor {
  if (item.type === 'other' && item.customTypeLabel?.trim()) {
    return getCustomTypeColor(item.customTypeLabel);
  }
  return getItemTypeColor(item.type);
}
