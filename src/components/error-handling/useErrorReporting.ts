import { useErrorContext } from '@/src/components/error-handling/ErrorContext';
import { ErrorContextData } from '@/src/components/error-handling/types';
import { useEffect, useMemo } from 'react';

export function useErrorReporting(initialContext: ErrorContextData) {
  const { setErrorContext, updateContext, errorContext } = useErrorContext();

  // Set initial context on mount
  useEffect(() => {
    if (initialContext) {
      setErrorContext(initialContext);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear context on unmount
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

  return {
    ...handlers,
    /**
     * @internal For unit testing only - we access the errorContext in the error boundary directly
     * Use updateErrorContext() and clearErrorContext() handlers instead.
     */
    errorContext,
  };
}
