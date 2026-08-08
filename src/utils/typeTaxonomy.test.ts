import type { Item } from '../models';
import {
  getDistinctCustomTypeLabels,
  normalizeTypeKey,
  searchItemTypes,
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
