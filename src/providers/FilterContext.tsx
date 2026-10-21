import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

type FilterKey = 'all' | string;

interface FilterContextValue {
  active: FilterKey;
  setActive: (k: FilterKey) => void;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  resetHomeFilter: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState<FilterKey>('all');
  const [isOpen, setIsOpen] = useState(false);
  const resetHomeFilter = useCallback(() => {
    setActive('all');
    setIsOpen(false);
  }, []);
  const value = useMemo(
    () => ({ active, setActive, isOpen, setIsOpen, resetHomeFilter }),
    [active, isOpen, resetHomeFilter],
  );
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilter = (): FilterContextValue => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilter must be used within FilterProvider');
  return ctx;
};
