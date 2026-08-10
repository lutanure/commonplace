import type { Item, ItemType } from '../models';
import { typeColors } from './typeColors';

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
  idea: { background: typeColors.mustard, text: typeColors.ink },
  note: { background: typeColors.mustard, text: typeColors.ink },
  article: { background: typeColors.navy, text: typeColors.cream },
  book: { background: typeColors.olive, text: typeColors.cream },
  quote: { background: typeColors.olive, text: typeColors.cream },
  movie: { background: typeColors.tomato, text: typeColors.cream },
  tv_show: { background: typeColors.tomato, text: typeColors.cream },
  song: { background: typeColors.plum, text: typeColors.cream },
  podcast: { background: typeColors.plum, text: typeColors.cream },
  product: { background: typeColors.navy, text: typeColors.cream },
  place: { background: typeColors.teal, text: typeColors.cream },
  recipe: { background: typeColors.teal, text: typeColors.cream },
  image: { background: typeColors.navy, text: typeColors.cream },
  other: { background: typeColors.clay, text: typeColors.cream },
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
  { background: typeColors.tomato, text: typeColors.cream },
  { background: typeColors.olive, text: typeColors.cream },
  { background: typeColors.mustard, text: typeColors.ink },
  { background: typeColors.teal, text: typeColors.cream },
  { background: typeColors.plum, text: typeColors.cream },
  { background: typeColors.navy, text: typeColors.cream },
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
