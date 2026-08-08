import { useMemo, useState } from 'react';
import type { Item } from '../models';
import { filterItemsByQuery } from '../utils/itemSearch';
import {
  getAvailableTypeFilters,
  itemMatchesTypeFilter,
  type TypeFilter,
  type TypeFilterOption,
} from '../utils/typeTaxonomy';

export interface UseLibrarySearchResult {
  query: string;
  setQuery: (query: string) => void;
  activeTypeFilter: TypeFilter | null;
  setActiveTypeFilter: (filter: TypeFilter | null) => void;
  availableTypeFilters: TypeFilterOption[];
  visibleItems: Item[];
  hasActiveFilters: boolean;
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

  const availableTypeFilters = useMemo(
    () => getAvailableTypeFilters(items),
    [items]
  );

  const visibleItems = useMemo(() => {
    const typeFiltered = activeTypeFilter
      ? items.filter((item) => itemMatchesTypeFilter(item, activeTypeFilter))
      : items;
    return filterItemsByQuery(typeFiltered, query);
  }, [items, query, activeTypeFilter]);

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
    hasActiveFilters: query.trim().length > 0 || activeTypeFilter !== null,
    clearFilters,
  };
}
