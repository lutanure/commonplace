import { useMemo, useState } from 'react';
import type { Item } from '../models';
import { filterItemsByQuery } from '../utils/itemSearch';
import {
  getAvailableTypeFilters,
  itemMatchesTypeFilter,
  type TypeFilter,
  type TypeFilterOption,
} from '../utils/typeTaxonomy';

// A presentation limit only — the default (no search/filter) Library view
// shows just the most recent items, using whatever recency ordering the
// given `items` array already arrives in (see sortItemsForLibrary in
// itemOrder.ts, applied upstream in ItemsContext: pinned-first, then
// createdAt descending). The full `items` collection is untouched and
// still backs search, filters, type-usage derivation, and Quick Add
// sanitation — only the rendered card list is capped.
export const LIBRARY_DEFAULT_VISIBLE_COUNT = 5;

export interface UseLibrarySearchResult {
  query: string;
  setQuery: (query: string) => void;
  activeTypeFilter: TypeFilter | null;
  setActiveTypeFilter: (filter: TypeFilter | null) => void;
  availableTypeFilters: TypeFilterOption[];
  visibleItems: Item[];
  hasActiveFilters: boolean;
  // Whether visibleItems has been trimmed down from the full library by the
  // default-view cap (as opposed to genuinely being the whole matching
  // set) — lets the UI avoid implying "that's everything" when it isn't.
  isLibraryCapped: boolean;
  clearFilters: () => void;
}

// Composes text search and type filtering over an already-loaded item
// list. Kept as a plain hook (not folded into ItemsContext) so filtering
// stays presentation-layer state, separate from the data/CRUD concerns
// ItemsContext owns.
export function useLibrarySearch(items: Item[]): UseLibrarySearchResult {
  const [query, setQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<TypeFilter | null>(
    null
  );

  const hasActiveFilters = query.trim().length > 0 || activeTypeFilter !== null;

  const availableTypeFilters = useMemo(
    () => getAvailableTypeFilters(items),
    [items]
  );

  const visibleItems = useMemo(() => {
    const typeFiltered = activeTypeFilter
      ? items.filter((item) => itemMatchesTypeFilter(item, activeTypeFilter))
      : items;
    const queried = filterItemsByQuery(typeFiltered, query);
    // Search/filters can always surface any matching item in the full
    // library — only the untouched default view is capped.
    return hasActiveFilters
      ? queried
      : queried.slice(0, LIBRARY_DEFAULT_VISIBLE_COUNT);
  }, [items, query, activeTypeFilter, hasActiveFilters]);

  const isLibraryCapped =
    !hasActiveFilters && items.length > LIBRARY_DEFAULT_VISIBLE_COUNT;

  function clearFilters() {
    setQuery('');
    setActiveTypeFilter(null);
  }

  return {
    query,
    setQuery,
    activeTypeFilter,
    setActiveTypeFilter,
    availableTypeFilters,
    visibleItems,
    hasActiveFilters,
    isLibraryCapped,
    clearFilters,
  };
}
