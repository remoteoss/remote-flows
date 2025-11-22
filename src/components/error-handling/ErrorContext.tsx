import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import type { ErrorContextData } from './types';
import { globalErrorContextRef } from '@/src/queryConfig';

export type ErrorContextValue = {
  errorContext: ErrorContextData;
  setErrorContext: (context: ErrorContextData) => void;
  updateContext: (updates: Partial<ErrorContextData>) => void;
};

export const ErrorContext = createContext<ErrorContextValue | undefined>(
  undefined,
);

export function ErrorContextProvider({ children }: { children: ReactNode }) {
  const [errorContext, setErrorContext] = useState<ErrorContextData>({});

  const updateContext = useCallback((updates: Partial<ErrorContextData>) => {
    setErrorContext((prev) => ({ ...prev, ...updates }));
  }, []);

  // Sync error context to global ref for React Query error handlers
  useEffect(() => {
    globalErrorContextRef.current = errorContext;
  }, [errorContext]);

  // Memoize the value object to prevent unnecessary re-renders
  // Note: setContext is stable from useState and doesn't need to be in deps
  const value = useMemo(
    () => ({ errorContext, setErrorContext, updateContext }),
    [errorContext, updateContext],
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
