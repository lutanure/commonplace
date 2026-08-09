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
