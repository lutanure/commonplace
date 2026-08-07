import type { Item, ItemType } from '../models';

const TYPE_LABELS: Record<ItemType, string> = {
  idea: 'Idea',
  note: 'Note',
  article: 'Article',
  book: 'Book',
  movie: 'Movie',
  tv_show: 'TV Show',
  song: 'Song',
  podcast: 'Podcast',
  product: 'Product',
  place: 'Place',
  recipe: 'Recipe',
  quote: 'Quote',
  image: 'Image',
  other: 'Other',
};

// All built-in types in picker order — 'other' always last as the escape
// hatch for anything the built-in list doesn't cover.
export const ITEM_TYPE_OPTIONS: { value: ItemType; label: string }[] = (
  Object.keys(TYPE_LABELS) as ItemType[]
).map((value) => ({ value, label: TYPE_LABELS[value] }));

// Presentation only — the stored type/captureType/customTypeLabel are
// unchanged by this function.
//  - type: 'other' with a customTypeLabel shows that label.
//  - type: 'other' from a pasted URL with no customTypeLabel falls back
//    to "Link", since that's almost always what an untyped pasted URL is.
//  - every other built-in type shows its human-readable label.
export function getItemTypeLabel(
  item: Pick<Item, 'type' | 'captureType' | 'customTypeLabel'>
): string {
  if (item.type === 'other') {
    const customLabel = item.customTypeLabel?.trim();
    if (customLabel) {
      return customLabel;
    }
    if (item.captureType === 'url') {
      return 'Link';
    }
  }
  return TYPE_LABELS[item.type];
}
