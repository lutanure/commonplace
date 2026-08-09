import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as itemsRepository from '../data/itemsRepository';
import type { NewItemInput } from '../data/mappers';
import type { Item } from '../models';
import { sortItemsForLibrary } from '../utils/itemOrder';

interface ItemsContextValue {
  items: Item[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addItem: (input: NewItemInput) => Promise<Item>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItemById: (id: string) => Item | undefined;
}

const ItemsContext = createContext<ItemsContextValue | undefined>(undefined);

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetched = await itemsRepository.listItems();
      setItems(sortItemsForLibrary(fetched));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load your library.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(async (input: NewItemInput) => {
    const created = await itemsRepository.createItem(input);
    setItems((current) => sortItemsForLibrary([created, ...current]));
    return created;
  }, []);

  // Reflects whatever the repository actually returns (DB-owned
  // updated_at/pinned_at, resolved tags, ...) rather than re-stamping
  // locally, so client and server state can't silently disagree.
  // Re-sorting here (not just after fetch) is what makes a pin/unpin
  // reorder the list immediately after its server response, rather than
  // waiting for the next refresh.
  const updateItem = useCallback(async (id: string, updates: Partial<Item>) => {
    const updated = await itemsRepository.updateItem(id, updates);
    setItems((current) =>
      sortItemsForLibrary(
        current.map((item) => (item.id === id ? updated : item))
      )
    );
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await itemsRepository.deleteItem(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const getItemById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      isLoading,
      error,
      refresh,
      addItem,
      updateItem,
      deleteItem,
      getItemById,
    }),
    [
      items,
      isLoading,
      error,
      refresh,
      addItem,
      updateItem,
      deleteItem,
      getItemById,
    ]
  );

  return (
    <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>
  );
}

export function useItems(): ItemsContextValue {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
}
