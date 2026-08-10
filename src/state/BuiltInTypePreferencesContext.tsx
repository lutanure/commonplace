import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as typeVisibilityRepository from '../data/typeVisibilityRepository';
import type { ItemType } from '../models';
import { sanitizeDisabledTypes } from '../utils/typeVisibility';

interface BuiltInTypePreferencesContextValue {
  disabledTypes: ItemType[];
  isLoading: boolean;
  isTypeEnabled: (type: ItemType) => boolean;
  setTypeEnabled: (type: ItemType, enabled: boolean) => Promise<void>;
}

const BuiltInTypePreferencesContext = createContext<
  BuiltInTypePreferencesContextValue | undefined
>(undefined);

export function BuiltInTypePreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [disabledTypes, setDisabledTypes] = useState<ItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    typeVisibilityRepository.loadDisabledBuiltInTypes().then((stored) => {
      if (cancelled) {
        return;
      }
      setDisabledTypes(sanitizeDisabledTypes(stored));
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setTypeEnabled = useCallback(
    async (type: ItemType, enabled: boolean) => {
      const next = enabled
        ? disabledTypes.filter((disabled) => disabled !== type)
        : sanitizeDisabledTypes([...disabledTypes, type]);
      setDisabledTypes(next);
      await typeVisibilityRepository.saveDisabledBuiltInTypes(next);
    },
    [disabledTypes]
  );

  const isTypeEnabled = useCallback(
    (type: ItemType) => !disabledTypes.includes(type),
    [disabledTypes]
  );

  const value = useMemo(
    () => ({ disabledTypes, isLoading, isTypeEnabled, setTypeEnabled }),
    [disabledTypes, isLoading, isTypeEnabled, setTypeEnabled]
  );

  return (
    <BuiltInTypePreferencesContext.Provider value={value}>
      {children}
    </BuiltInTypePreferencesContext.Provider>
  );
}

export function useBuiltInTypePreferences(): BuiltInTypePreferencesContextValue {
  const context = useContext(BuiltInTypePreferencesContext);
  if (!context) {
    throw new Error(
      'useBuiltInTypePreferences must be used within a BuiltInTypePreferencesProvider'
    );
  }
  return context;
}
