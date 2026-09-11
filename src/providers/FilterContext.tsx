import { createContext, useContext, useState, type ReactNode } from 'react';

type FilterKey = 'all' | string;

interface FilterContextValue {
  active: FilterKey;
  setActive: (k: FilterKey) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState<FilterKey>('all');
  return <FilterContext.Provider value={{ active, setActive }}>{children}</FilterContext.Provider>;
};

export const useFilter = (): FilterContextValue => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilter must be used within FilterProvider');
  return ctx;
};
