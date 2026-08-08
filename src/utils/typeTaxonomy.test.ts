import type { Item } from '../models';
import {
  getAvailableTypeFilters,
  getDistinctBuiltInTypes,
  getDistinctCustomTypeLabels,
  isSameTypeFilter,
  itemMatchesTypeFilter,
  normalizeTypeKey,
  searchItemTypes,
  type TypeFilter,
} from './typeTaxonomy';

function makeItem(overrides: Partial<Item>): Item {
  return {
    id: 'item-1',
    title: 'Untitled',
    type: 'other',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    captureType: 'manual',
    tags: [],
    ...overrides,
  };
}

describe('normalizeTypeKey', () => {
  it('trims and lowercases', () => {
    expect(normalizeTypeKey('  Research Paper  ')).toBe('research paper');
  });
});

describe('getDistinctCustomTypeLabels', () => {
  it('only considers items with type "other"', () => {
    const items = [
      makeItem({ type: 'movie', customTypeLabel: 'should be ignored' }),
      makeItem({ type: 'other', customTypeLabel: 'Research Paper' }),
    ];
    expect(getDistinctCustomTypeLabels(items)).toEqual(['Research Paper']);
  });

  it('dedupes case-insensitively, keeping the first-seen casing', () => {
    const items = [
      makeItem({ type: 'other', customTypeLabel: 'Research Paper' }),
      makeItem({ type: 'other', customTypeLabel: 'research paper' }),
      makeItem({ type: 'other', customTypeLabel: 'RESEARCH PAPER' }),
    ];
    expect(getDistinctCustomTypeLabels(items)).toEqual(['Research Paper']);
  });

  it('skips items with a missing or blank customTypeLabel', () => {
    const items = [
      makeItem({ type: 'other', customTypeLabel: undefined }),
      makeItem({ type: 'other', customTypeLabel: '   ' }),
    ];
    expect(getDistinctCustomTypeLabels(items)).toEqual([]);
  });

  it('preserves distinct labels separately', () => {
    const items = [
      makeItem({ type: 'other', customTypeLabel: 'Research Paper' }),
      makeItem({ type: 'other', customTypeLabel: 'Research Notes' }),
    ];
    expect(getDistinctCustomTypeLabels(items)).toEqual([
      'Research Paper',
      'Research Notes',
    ]);
  });
});

describe('searchItemTypes', () => {
  const items = [
    makeItem({ type: 'other', customTypeLabel: 'Research Paper' }),
    makeItem({ type: 'other', customTypeLabel: 'Research Notes' }),
  ];

  it('returns all built-ins (minus "other") and all custom labels for an empty query', () => {
    const result = searchItemTypes('', items);
    expect(result.builtIns.some((option) => option.value === 'other')).toBe(
      false
    );
    expect(result.builtIns.some((option) => option.value === 'movie')).toBe(
      true
    );
    expect(result.customLabels).toEqual(['Research Paper', 'Research Notes']);
    expect(result.exactMatch).toBe(false);
  });

  it('filters built-in labels by a case-insensitive substring match', () => {
    expect(searchItemTypes('mov', []).builtIns.map((o) => o.label)).toEqual([
      'Movie',
    ]);
    expect(searchItemTypes('MOV', []).builtIns.map((o) => o.label)).toEqual([
      'Movie',
    ]);
  });

  it('filters custom labels by substring, matching more than one when applicable', () => {
    const result = searchItemTypes('research', items);
    expect(result.customLabels).toEqual(['Research Paper', 'Research Notes']);
    expect(result.builtIns).toEqual([]);
  });

  it('reports exactMatch only for a full case-insensitive label match, not a substring', () => {
    expect(searchItemTypes('movie', []).exactMatch).toBe(true);
    expect(searchItemTypes('MOVIE', []).exactMatch).toBe(true);
    expect(searchItemTypes('mov', []).exactMatch).toBe(false);
    expect(searchItemTypes('research paper', items).exactMatch).toBe(true);
    expect(searchItemTypes('research', items).exactMatch).toBe(false);
  });

  it('never reports an exact match for an empty query', () => {
    expect(searchItemTypes('', items).exactMatch).toBe(false);
  });
});

describe('getDistinctBuiltInTypes', () => {
  it('returns only built-in types with at least one item, in ITEM_TYPE_OPTIONS order', () => {
    const items = [
      makeItem({ type: 'book' }),
      makeItem({ type: 'movie' }),
      makeItem({ type: 'movie' }),
      makeItem({ type: 'other', customTypeLabel: 'Research Paper' }),
    ];
    expect(getDistinctBuiltInTypes(items)).toEqual(['book', 'movie']);
  });

  it('never includes "other"', () => {
    const items = [
      makeItem({ type: 'other', customTypeLabel: 'Research Paper' }),
    ];
    expect(getDistinctBuiltInTypes(items)).toEqual([]);
  });

  it('returns an empty array for no items', () => {
    expect(getDistinctBuiltInTypes([])).toEqual([]);
  });
});

describe('getAvailableTypeFilters', () => {
  it('combines built-in types in use and distinct custom labels in use', () => {
    const items = [
      makeItem({ type: 'movie' }),
      makeItem({ type: 'other', customTypeLabel: 'Research Paper' }),
      makeItem({ type: 'other', customTypeLabel: 'research paper' }),
    ];
    const filters = getAvailableTypeFilters(items);

    expect(filters).toEqual([
      {
        key: 'builtin:movie',
        label: 'Movie',
        filter: { kind: 'builtin', value: 'movie' },
      },
      {
        key: 'custom:research paper',
        label: 'Research Paper',
        filter: { kind: 'custom', label: 'Research Paper' },
      },
    ]);
  });

  it('returns an empty array for no items', () => {
    expect(getAvailableTypeFilters([])).toEqual([]);
  });
});

describe('itemMatchesTypeFilter', () => {
  it('matches everything when the filter is null', () => {
    expect(itemMatchesTypeFilter(makeItem({ type: 'movie' }), null)).toBe(true);
  });

  it('matches a builtin filter by exact type', () => {
    const filter: TypeFilter = { kind: 'builtin', value: 'movie' };
    expect(itemMatchesTypeFilter(makeItem({ type: 'movie' }), filter)).toBe(
      true
    );
    expect(itemMatchesTypeFilter(makeItem({ type: 'book' }), filter)).toBe(
      false
    );
  });

  it('matches a custom filter case-insensitively against customTypeLabel', () => {
    const filter: TypeFilter = { kind: 'custom', label: 'research paper' };
    expect(
      itemMatchesTypeFilter(
        makeItem({ type: 'other', customTypeLabel: 'Research Paper' }),
        filter
      )
    ).toBe(true);
  });

  it('does not let a custom filter match a builtin item with the same-looking type name', () => {
    const filter: TypeFilter = { kind: 'custom', label: 'Movie' };
    expect(itemMatchesTypeFilter(makeItem({ type: 'movie' }), filter)).toBe(
      false
    );
  });
});

describe('isSameTypeFilter', () => {
  it('treats two nulls as equal', () => {
    expect(isSameTypeFilter(null, null)).toBe(true);
  });

  it('treats null and a filter as different', () => {
    expect(isSameTypeFilter(null, { kind: 'builtin', value: 'movie' })).toBe(
      false
    );
  });

  it('compares builtin filters by value', () => {
    expect(
      isSameTypeFilter(
        { kind: 'builtin', value: 'movie' },
        { kind: 'builtin', value: 'movie' }
      )
    ).toBe(true);
    expect(
      isSameTypeFilter(
        { kind: 'builtin', value: 'movie' },
        { kind: 'builtin', value: 'book' }
      )
    ).toBe(false);
  });

  it('compares custom filters case-insensitively', () => {
    expect(
      isSameTypeFilter(
        { kind: 'custom', label: 'Research Paper' },
        { kind: 'custom', label: 'research paper' }
      )
    ).toBe(true);
  });

  it('never treats a builtin and custom filter as the same', () => {
    expect(
      isSameTypeFilter(
        { kind: 'builtin', value: 'movie' },
        { kind: 'custom', label: 'Movie' }
      )
    ).toBe(false);
  });
});
