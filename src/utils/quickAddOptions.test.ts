import type { Item } from '../models';
import {
  DEFAULT_QUICK_ADD_OPTIONS,
  MAX_QUICK_ADD_OPTIONS,
  quickAddOptionsNeedSanitizing,
  sanitizeQuickAddOptions,
} from './quickAddOptions';

function makeItem(overrides: Partial<Item>): Item {
  return {
    id: 'item-1',
    title: 'Untitled',
    type: 'other',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    captureType: 'manual',
    tags: [],
    isPinned: false,
    ...overrides,
  };
}

const itemsWithCustomType: Item[] = [
  makeItem({ id: 'a', type: 'other', customTypeLabel: 'Recipe' }),
];

describe('sanitizeQuickAddOptions', () => {
  it('keeps a valid, in-range list unchanged', () => {
    const stored = [
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'movie' },
      { kind: 'custom', label: 'Recipe' },
    ];
    expect(sanitizeQuickAddOptions(stored, itemsWithCustomType)).toEqual(
      stored
    );
  });

  it('drops a custom-type entry once no item uses that label anymore', () => {
    const stored = [
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'movie' },
      { kind: 'custom', label: 'Recipe' },
    ];
    // "Recipe" is no longer used by anything (e.g. the label was cleared).
    const result = sanitizeQuickAddOptions(stored, []);
    expect(result).not.toContainEqual({ kind: 'custom', label: 'Recipe' });
  });

  it('drops malformed entries', () => {
    const stored = [
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'note' },
      null,
      'idea',
      { kind: 'custom' },
      { kind: 'nonsense' },
    ];
    const result = sanitizeQuickAddOptions(stored, []);
    // idea/note survive; below the minimum of 3 backfills just one more
    // default (book) to reach it.
    expect(result).toEqual([
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'note' },
      { kind: 'builtin', value: 'book' },
    ]);
  });

  it("drops a builtin entry that isn't a real selectable type", () => {
    const stored = [
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'not-a-real-type' },
      { kind: 'builtin', value: 'other' }, // 'other' is the custom escape hatch, not selectable
    ];
    const result = sanitizeQuickAddOptions(stored, []);
    expect(result).not.toContainEqual({
      kind: 'builtin',
      value: 'not-a-real-type',
    });
    expect(result).not.toContainEqual({ kind: 'builtin', value: 'other' });
  });

  it('de-dupes repeated entries', () => {
    const stored = [
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'note' },
    ];
    const result = sanitizeQuickAddOptions(stored, []);
    expect(
      result.filter((o) => 'value' in o && o.value === 'idea')
    ).toHaveLength(1);
  });

  it('clamps to the maximum', () => {
    const stored = [
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'note' },
      { kind: 'builtin', value: 'book' },
      { kind: 'builtin', value: 'movie' },
      { kind: 'builtin', value: 'tv_show' },
      { kind: 'builtin', value: 'song' },
    ];
    const result = sanitizeQuickAddOptions(stored, []);
    expect(result).toHaveLength(MAX_QUICK_ADD_OPTIONS);
  });

  it('falls back to just the minimum for empty/non-array input', () => {
    // sanitizeQuickAddOptions only ever backfills up to the minimum — a
    // brand new install with nothing stored yet gets the full
    // DEFAULT_QUICK_ADD_OPTIONS, but that happens upstream in
    // QuickAddPreferencesContext, not via this backfill.
    const minimalDefaults = DEFAULT_QUICK_ADD_OPTIONS.slice(0, 3);
    expect(sanitizeQuickAddOptions(undefined, [])).toEqual(minimalDefaults);
    expect(sanitizeQuickAddOptions([], [])).toEqual(minimalDefaults);
    expect(sanitizeQuickAddOptions('nonsense', [])).toEqual(minimalDefaults);
  });

  it('backfills only enough defaults to reach the minimum, skipping ones already present', () => {
    // Only 'idea' survives; backfill adds just 'note' to reach the
    // minimum of 3, not the whole remaining default set.
    const result = sanitizeQuickAddOptions(
      [{ kind: 'builtin', value: 'idea' }],
      []
    );
    expect(result).toEqual([
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'note' },
      { kind: 'builtin', value: 'book' },
    ]);
  });

  it('preserves surviving user selections and their order, backfilling only the shortfall', () => {
    // Mirrors a real scenario: [Quote, Recipe, Idea] where "Recipe" (a
    // custom type) has been deleted. Quote and Idea must survive in their
    // original relative order — the whole list must not be replaced by
    // the defaults just because one entry became invalid.
    const stored = [
      { kind: 'builtin', value: 'quote' },
      { kind: 'custom', label: 'Recipe' },
      { kind: 'builtin', value: 'idea' },
    ];
    const result = sanitizeQuickAddOptions(stored, []); // "Recipe" no longer used by any item
    expect(result).toEqual([
      { kind: 'builtin', value: 'quote' },
      { kind: 'builtin', value: 'idea' },
      // First default not already selected (idea is already present).
      { kind: 'builtin', value: 'note' },
    ]);
  });
});

describe('sanitizeQuickAddOptions with disabled built-in types', () => {
  it('drops a builtin entry whose type has been disabled, preserving surviving order', () => {
    // [Quote, Article, Idea] where "Article" has just been disabled in
    // Manage Types — Quote and Idea must survive in their original
    // relative order, backfilling only the shortfall.
    const stored = [
      { kind: 'builtin', value: 'quote' },
      { kind: 'builtin', value: 'article' },
      { kind: 'builtin', value: 'idea' },
    ];
    const result = sanitizeQuickAddOptions(stored, [], ['article']);
    expect(result).toEqual([
      { kind: 'builtin', value: 'quote' },
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'note' },
    ]);
  });

  it('skips a disabled default when backfilling, without needing 3 real survivors', () => {
    // Nothing survives; 'idea' (the first curated default) is disabled, so
    // backfill should move on to 'note'/'book' instead of stopping short.
    const result = sanitizeQuickAddOptions([], [], ['idea']);
    expect(result).toEqual([
      { kind: 'builtin', value: 'note' },
      { kind: 'builtin', value: 'book' },
      { kind: 'builtin', value: 'movie' },
    ]);
  });

  it('falls through to any other enabled built-in when every curated default is disabled', () => {
    const result = sanitizeQuickAddOptions(
      [],
      [],
      ['idea', 'note', 'book', 'movie']
    );
    expect(result).toHaveLength(3);
    for (const option of result) {
      expect(option.kind).toBe('builtin');
      if (option.kind === 'builtin') {
        expect(['idea', 'note', 'book', 'movie']).not.toContain(option.value);
      }
    }
  });

  it('a re-enabled type is selectable again (no disabled list = no restriction)', () => {
    const stored = [{ kind: 'builtin', value: 'article' }];
    expect(sanitizeQuickAddOptions(stored, [], [])).toContainEqual({
      kind: 'builtin',
      value: 'article',
    });
  });
});

describe('quickAddOptionsNeedSanitizing', () => {
  it('is false for an already-valid list', () => {
    const stored = [
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'note' },
      { kind: 'builtin', value: 'book' },
    ];
    expect(quickAddOptionsNeedSanitizing(stored, [])).toBe(false);
  });

  it('is true once a referenced custom type no longer exists', () => {
    const stored = [
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'note' },
      { kind: 'custom', label: 'Recipe' },
    ];
    expect(quickAddOptionsNeedSanitizing(stored, [])).toBe(true);
    expect(quickAddOptionsNeedSanitizing(stored, itemsWithCustomType)).toBe(
      false
    );
  });

  it('is true once a selected built-in type gets disabled', () => {
    const stored = [
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'article' },
      { kind: 'builtin', value: 'note' },
    ];
    expect(quickAddOptionsNeedSanitizing(stored, [], [])).toBe(false);
    expect(quickAddOptionsNeedSanitizing(stored, [], ['article'])).toBe(true);
  });
});
