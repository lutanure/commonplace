import type { Item } from '../models';
import {
  buildSearchHaystack,
  filterItemsByQuery,
  itemMatchesQuery,
  normalizeSearchText,
} from './itemSearch';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    title: 'Untitled',
    type: 'note',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    captureType: 'manual',
    tags: [],
    isPinned: false,
    ...overrides,
  };
}

describe('normalizeSearchText', () => {
  it('trims and lowercases', () => {
    expect(normalizeSearchText('  Dune  ')).toBe('dune');
  });

  it('strips diacritics so accented and plain forms compare equal', () => {
    expect(normalizeSearchText('café')).toBe('cafe');
    expect(normalizeSearchText('São Paulo')).toBe('sao paulo');
  });
});

describe('buildSearchHaystack', () => {
  it('includes every searchable field', () => {
    const item = makeItem({
      title: 'Dune',
      type: 'movie',
      category: 'Sci-fi',
      tags: [{ id: 't1', name: 'Favorites' }],
      originalText: 'A desert planet story',
      userNote: 'Watch with Sam',
      summary: 'Paul Atreides rises',
      entities: ['Paul Atreides', 'Arrakis'],
      sourceName: 'IMDb',
      sourceUrl: 'https://imdb.com/title/dune',
      whySaved: 'Recommended by Jess',
      relevantInfo: [{ label: 'Director', value: 'Denis Villeneuve' }],
    });
    const haystack = buildSearchHaystack(item);

    expect(haystack).toContain('dune');
    expect(haystack).toContain('movie');
    expect(haystack).toContain('sci-fi');
    expect(haystack).toContain('favorites');
    expect(haystack).toContain('desert planet');
    expect(haystack).toContain('watch with sam');
    expect(haystack).toContain('paul atreides rises');
    expect(haystack).toContain('arrakis');
    expect(haystack).toContain('imdb');
    expect(haystack).toContain('imdb.com/title/dune');
    expect(haystack).toContain('recommended by jess');
    expect(haystack).toContain('director');
    expect(haystack).toContain('denis villeneuve');
  });

  it('includes a custom type label via getItemTypeLabel', () => {
    const item = makeItem({ type: 'other', customTypeLabel: 'Research Paper' });
    expect(buildSearchHaystack(item)).toContain('research paper');
  });

  it('does not throw when optional fields are missing', () => {
    const item = makeItem();
    expect(() => buildSearchHaystack(item)).not.toThrow();
  });
});

describe('Source search regression', () => {
  it('finds an item by its Source (sourceName), case-insensitively', () => {
    const item = makeItem({ title: 'Banana bread', sourceName: 'Mom' });
    expect(itemMatchesQuery(item, 'mom')).toBe(true);
    expect(filterItemsByQuery([item], 'mom')).toEqual([item]);
  });
});

describe('itemMatchesQuery', () => {
  const item = makeItem({
    title: 'Dune',
    summary: 'A café in São Paulo is mentioned',
    tags: [{ id: 't1', name: 'Sci-Fi' }],
  });

  it('matches case-insensitively', () => {
    expect(itemMatchesQuery(item, 'DUNE')).toBe(true);
    expect(itemMatchesQuery(item, 'dune')).toBe(true);
  });

  it('matches diacritic-insensitively', () => {
    expect(itemMatchesQuery(item, 'cafe')).toBe(true);
    expect(itemMatchesQuery(item, 'sao')).toBe(true);
  });

  it('is forgiving of word order across multiple tokens (AND match)', () => {
    expect(itemMatchesQuery(item, 'sci-fi dune')).toBe(true);
    expect(itemMatchesQuery(item, 'dune sci-fi')).toBe(true);
  });

  it('requires every token to match', () => {
    expect(itemMatchesQuery(item, 'dune nonexistent')).toBe(false);
  });

  it('treats an empty or whitespace-only query as matching everything', () => {
    expect(itemMatchesQuery(item, '')).toBe(true);
    expect(itemMatchesQuery(item, '   ')).toBe(true);
  });
});

describe('filterItemsByQuery', () => {
  const items = [
    makeItem({ id: 'a', title: 'Dune' }),
    makeItem({ id: 'b', title: 'Foundation' }),
  ];

  it('returns only matching items', () => {
    expect(filterItemsByQuery(items, 'dune').map((i) => i.id)).toEqual(['a']);
  });

  it('returns all items for an empty query', () => {
    expect(filterItemsByQuery(items, '')).toEqual(items);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterItemsByQuery(items, 'nonexistent')).toEqual([]);
  });
});
