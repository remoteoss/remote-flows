import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
  RefObject,
} from 'react';
import type { ErrorContextData } from './types';

export type ErrorContextValue = {
  errorContextRef: RefObject<ErrorContextData>;
  updateContext: (updates: Partial<ErrorContextData>) => void;
};

export const ErrorContext = createContext<ErrorContextValue | undefined>(
  undefined,
);

export function ErrorContextProvider({ children }: { children: ReactNode }) {
  const errorContextRef = useRef<ErrorContextData>({});

  const updateContext = useCallback((updates: Partial<ErrorContextData>) => {
    errorContextRef.current = { ...errorContextRef.current, ...updates };
  }, []);

  // Memoize the value object to prevent unnecessary re-renders
  // Note: setContext is stable from useState and doesn't need to be in deps
  const value = useMemo(
    () => ({
      errorContextRef,
      updateContext,
    }),
    [updateContext],
  );

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
}

export const useErrorContext = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) {
    throw new Error('useErrorContext must be used within ErrorContextProvider');
  }
  return ctx;
};
