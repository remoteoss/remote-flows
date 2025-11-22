import { useErrorContext } from '@/src/components/error-handling/ErrorContext';
import { ErrorContextData } from '@/src/components/error-handling/types';
import { useEffect, useMemo } from 'react';

export function useErrorReporting(initialContext: ErrorContextData) {
  const { setErrorContext, updateContext } = useErrorContext();

  // Set initial context on mount
  // Note: setContext is stable from useState, doesn't need to be in deps
  useEffect(() => {
    if (initialContext) {
      setErrorContext(initialContext);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear context on unmount
  // Note: setContext is stable, doesn't need to be in deps
  useEffect(() => {
    return () => {
      setErrorContext({});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Note: setContext and updateContext are stable, don't need to be in deps
  const handlers = useMemo(
    () => ({
      updateErrorContext: (updates: Partial<ErrorContextData>) => {
        updateContext(updates);
      },

      clearErrorContext: () => {
        setErrorContext({});
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return handlers;
}
