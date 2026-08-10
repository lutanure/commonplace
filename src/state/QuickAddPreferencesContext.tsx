import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as quickAddPreferencesRepository from '../data/quickAddPreferencesRepository';
import {
  DEFAULT_QUICK_ADD_OPTIONS,
  quickAddOptionsNeedSanitizing,
  sanitizeQuickAddOptions,
} from '../utils/quickAddOptions';
import type { TypeFilter } from '../utils/typeTaxonomy';
import { useBuiltInTypePreferences } from './BuiltInTypePreferencesContext';
import { useItems } from './ItemsContext';

interface QuickAddPreferencesContextValue {
  options: TypeFilter[];
  isLoading: boolean;
  setOptions: (options: TypeFilter[]) => Promise<void>;
}

const QuickAddPreferencesContext = createContext<
  QuickAddPreferencesContextValue | undefined
>(undefined);

export function QuickAddPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { items, isLoading: isItemsLoading } = useItems();
  const { disabledTypes } = useBuiltInTypePreferences();
  const [options, setOptionsState] = useState<TypeFilter[]>(
    DEFAULT_QUICK_ADD_OPTIONS
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedStoredValue, setHasLoadedStoredValue] = useState(false);

  useEffect(() => {
    let cancelled = false;
    quickAddPreferencesRepository.loadQuickAddPreferences().then((stored) => {
      if (cancelled) {
        return;
      }
      // Items haven't necessarily loaded yet — sanitizing against `[]` here
      // would wrongly drop every custom-type entry. The items-change effect
      // below re-sanitizes as soon as the real list is in, so an
      // unsanitized value briefly in state is safe and self-corrects.
      setOptionsState(
        Array.isArray(stored)
          ? (stored as TypeFilter[])
          : DEFAULT_QUICK_ADD_OPTIONS
      );
      setHasLoadedStoredValue(true);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-sanitize whenever the underlying items OR the disabled-built-in-type
  // preference change — this is what guarantees a Quick Add option can
  // never keep pointing at a custom type after its last item stops using
  // that label (e.g. Manage Types deletion), or at a built-in type the
  // user has just disabled.
  useEffect(() => {
    if (!hasLoadedStoredValue || isItemsLoading) {
      return;
    }
    setOptionsState((current) => {
      if (!quickAddOptionsNeedSanitizing(current, items, disabledTypes)) {
        return current;
      }
      const sanitized = sanitizeQuickAddOptions(current, items, disabledTypes);
      quickAddPreferencesRepository
        .saveQuickAddPreferences(sanitized)
        .catch(() => {});
      return sanitized;
    });
  }, [items, isItemsLoading, hasLoadedStoredValue, disabledTypes]);

  const setOptions = useCallback(
    async (next: TypeFilter[]) => {
      const sanitized = sanitizeQuickAddOptions(next, items, disabledTypes);
      setOptionsState(sanitized);
      await quickAddPreferencesRepository.saveQuickAddPreferences(sanitized);
    },
    [items, disabledTypes]
  );

  const value = useMemo(
    () => ({ options, isLoading, setOptions }),
    [options, isLoading, setOptions]
  );

  return (
    <QuickAddPreferencesContext.Provider value={value}>
      {children}
    </QuickAddPreferencesContext.Provider>
  );
}

export function useQuickAddPreferences(): QuickAddPreferencesContextValue {
  const context = useContext(QuickAddPreferencesContext);
  if (!context) {
    throw new Error(
      'useQuickAddPreferences must be used within a QuickAddPreferencesProvider'
    );
  }
  return context;
}
