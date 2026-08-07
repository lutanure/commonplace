import type { Item } from '../models';

const TYPE_LABELS: Record<Item['type'], string> = {
  article: 'Article',
  note: 'Note',
  idea: 'Idea',
  product: 'Product',
  movie: 'Movie',
  song: 'Song',
  place: 'Place',
  image: 'Image',
  other: 'Other',
};

// Presentation only — the stored type/captureType are unchanged. A pasted
// link is stored as type: 'other' + captureType: 'url' until AI can
// classify what it actually is, but a user should never see "Other".
export function getItemTypeLabel(item: Pick<Item, 'type' | 'captureType'>): string {
  if (item.type === 'other' && item.captureType === 'url') {
    return 'Link';
  }
  return TYPE_LABELS[item.type];
}
