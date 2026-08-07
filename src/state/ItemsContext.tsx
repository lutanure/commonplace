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
  getItemById: (id: string) => Item | undefined;
}

const ItemsContext = createContext<ItemsContextValue | undefined>(undefined);

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(mockItems);

  const addItem = useCallback((item: Item) => {
    setItems((current) => [item, ...current]);
  }, []);

  const getItemById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, getItemById }),
    [items, addItem, getItemById]
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
