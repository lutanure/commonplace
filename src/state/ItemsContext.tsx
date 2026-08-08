import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { mockItems } from '../data/mockItems';
import type { Item } from '../models';

interface ItemsContextValue {
  items: Item[];
  addItem: (item: Item) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => Item | undefined;
}

const ItemsContext = createContext<ItemsContextValue | undefined>(undefined);

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(mockItems);

  const addItem = useCallback((item: Item) => {
    setItems((current) => [item, ...current]);
  }, []);

  // Merges `updates` onto the existing item — any field not present in
  // `updates` is left untouched, so callers only need to pass what's
  // actually changing. `id`/`createdAt` are always preserved regardless
  // of what's passed in, and `updatedAt` is always stamped fresh here so
  // callers can't forget it.
  const updateItem = useCallback((id: string, updates: Partial<Item>) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              id: item.id,
              createdAt: item.createdAt,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const getItemById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, updateItem, deleteItem, getItemById }),
    [items, addItem, updateItem, deleteItem, getItemById]
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
