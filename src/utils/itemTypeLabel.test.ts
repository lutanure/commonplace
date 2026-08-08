import type { CaptureType, ItemType } from '../models';
import { getItemTypeLabel, ITEM_TYPE_OPTIONS } from './itemTypeLabel';

const BUILT_IN_LABELS: Record<Exclude<ItemType, 'other'>, string> = {
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
};

describe('getItemTypeLabel', () => {
  it.each(Object.entries(BUILT_IN_LABELS) as [ItemType, string][])(
    'maps built-in type %s to label %s',
    (type, label) => {
      expect(
        getItemTypeLabel({ type, captureType: 'manual' as CaptureType })
      ).toBe(label);
    }
  );

  it('prefers a customTypeLabel over the "Link" fallback for a url capture', () => {
    expect(
      getItemTypeLabel({
        type: 'other',
        captureType: 'url',
        customTypeLabel: 'Research Paper',
      })
    ).toBe('Research Paper');
  });

  it('falls back to "Link" for an untyped url capture with no custom label', () => {
    expect(getItemTypeLabel({ type: 'other', captureType: 'url' })).toBe(
      'Link'
    );
  });

  it('falls back to "Other" when there is no custom label and it was not a url capture', () => {
    expect(getItemTypeLabel({ type: 'other', captureType: 'manual' })).toBe(
      'Other'
    );
  });

  it('treats a whitespace-only customTypeLabel as absent', () => {
    expect(
      getItemTypeLabel({
        type: 'other',
        captureType: 'manual',
        customTypeLabel: '   ',
      })
    ).toBe('Other');
  });

  it('exposes every built-in type in ITEM_TYPE_OPTIONS with "other" last', () => {
    expect(ITEM_TYPE_OPTIONS.at(-1)).toEqual({
      value: 'other',
      label: 'Other',
    });
    expect(ITEM_TYPE_OPTIONS.map((o) => o.value)).toEqual(
      expect.arrayContaining(Object.keys(BUILT_IN_LABELS))
    );
  });
});
