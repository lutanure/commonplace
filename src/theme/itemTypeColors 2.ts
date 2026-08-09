import type { ItemType } from '../models';
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
