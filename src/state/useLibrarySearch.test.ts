import { act, renderHook } from '@testing-library/react-native';
import type { Item } from '../models';
import { useLibrarySearch } from './useLibrarySearch';

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

const items: Item[] = [
  makeItem({ id: 'dune', title: 'Dune', type: 'movie' }),
  makeItem({ id: 'foundation', title: 'Foundation', type: 'book' }),
  makeItem({
    id: 'paper',
    title: 'Neural Nets',
    type: 'other',
    customTypeLabel: 'Research Paper',
  }),
];

describe('useLibrarySearch', () => {
  it('shows every item and every present type filter when nothing is active', () => {
    const { result } = renderHook(() => useLibrarySearch(items));

    expect(result.current.visibleItems).toEqual(items);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.availableTypeFilters.map((f) => f.label)).toEqual([
      'Book',
      'Movie',
      'Research Paper',
    ]);
  });

  it('narrows visibleItems as the query changes', () => {
    const { result } = renderHook(() => useLibrarySearch(items));

    act(() => {
      result.current.setQuery('dune');
    });

    expect(result.current.visibleItems.map((i) => i.id)).toEqual(['dune']);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('narrows visibleItems by the active type filter', () => {
    const { result } = renderHook(() => useLibrarySearch(items));

    act(() => {
      result.current.setActiveTypeFilter({ kind: 'builtin', value: 'book' });
    });

    expect(result.current.visibleItems.map((i) => i.id)).toEqual([
      'foundation',
    ]);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('applies a custom type filter alongside a text query with AND semantics', () => {
    const { result } = renderHook(() => useLibrarySearch(items));

    act(() => {
      result.current.setActiveTypeFilter({
        kind: 'custom',
        label: 'Research Paper',
      });
      result.current.setQuery('neural');
    });
    expect(result.current.visibleItems.map((i) => i.id)).toEqual(['paper']);

    act(() => {
      result.current.setQuery('dune');
    });
    expect(result.current.visibleItems).toEqual([]);
  });

  it('clearFilters resets both the query and the type filter', () => {
    const { result } = renderHook(() => useLibrarySearch(items));

    act(() => {
      result.current.setQuery('dune');
      result.current.setActiveTypeFilter({ kind: 'builtin', value: 'movie' });
    });
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.query).toBe('');
    expect(result.current.activeTypeFilter).toBeNull();
    expect(result.current.visibleItems).toEqual(items);
    expect(result.current.hasActiveFilters).toBe(false);
  });
});

describe('useLibrarySearch default-view cap', () => {
  // Six items — one more than LIBRARY_DEFAULT_VISIBLE_COUNT (5) — so the
  // 6th ("older") is expected to be excluded from the default view but
  // still reachable via search.
  const manyItems: Item[] = [
    makeItem({ id: '1', title: 'Newest' }),
    makeItem({ id: '2', title: 'Second' }),
    makeItem({ id: '3', title: 'Third' }),
    makeItem({ id: '4', title: 'Fourth' }),
    makeItem({ id: '5', title: 'Fifth' }),
    makeItem({ id: '6', title: 'Sixth older item', sourceName: 'Mom' }),
  ];

  it('caps the default (no search/filter) view at 5 items, in the given order', () => {
    const { result } = renderHook(() => useLibrarySearch(manyItems));

    expect(result.current.visibleItems.map((i) => i.id)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
    ]);
    expect(result.current.isLibraryCapped).toBe(true);
  });

  it('does not report the library as capped when there are 5 or fewer items', () => {
    const { result } = renderHook(() =>
      useLibrarySearch(manyItems.slice(0, 5))
    );

    expect(result.current.visibleItems).toHaveLength(5);
    expect(result.current.isLibraryCapped).toBe(false);
  });

  it('search reaches items beyond the default 5-item cap', () => {
    const { result } = renderHook(() => useLibrarySearch(manyItems));

    act(() => {
      result.current.setQuery('mom');
    });

    expect(result.current.visibleItems.map((i) => i.id)).toEqual(['6']);
    expect(result.current.isLibraryCapped).toBe(false);
  });

  it('a type filter also reaches items beyond the default 5-item cap', () => {
    const withOlderMovie = [
      ...manyItems,
      makeItem({ id: '7', title: 'Seventh', type: 'movie' }),
    ];
    const { result } = renderHook(() => useLibrarySearch(withOlderMovie));

    act(() => {
      result.current.setActiveTypeFilter({ kind: 'builtin', value: 'movie' });
    });

    expect(result.current.visibleItems.map((i) => i.id)).toEqual(['7']);
  });
});
