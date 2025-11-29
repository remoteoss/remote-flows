import { reportTelemetryError } from '@/src/components/error-handling/telemetryService';
import { npmPackageVersion } from '@/src/lib/version';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import type { ErrorContextData } from '@/src/components/error-handling/types';
import { Environment } from '@/src/environments';
import { Client } from '@/src/client/client';

/**
 * Global ref to store the current error context
 * Updated by ErrorContextProvider, accessed by React Query error handlers
 */
export const globalErrorContextRef: { current: ErrorContextData } = {
  current: {},
};

export const getQueryClient = (
  debug: boolean,
  client: Client,
  environment?: Environment,
) =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (error instanceof Error) {
          reportTelemetryError(
            error,
            npmPackageVersion,
            client,
            environment,
            {
              ...globalErrorContextRef.current,
              metadata: {
                ...globalErrorContextRef.current.metadata,
                queryKey: JSON.stringify(query.queryKey),
              },
            },
            {
              debugMode: debug,
            },
          );
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (error instanceof Error) {
          reportTelemetryError(
            error,
            npmPackageVersion,
            client,
            environment,
            {
              ...globalErrorContextRef.current,
              metadata: {
                ...globalErrorContextRef.current.metadata,
                mutationKey: JSON.stringify(mutation.options.mutationKey),
              },
            },
            {
              debugMode: debug,
            },
          );
        }
      },
    }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof Error) {
            const message = error.message.toLowerCase();
            if (
              message.includes('400') ||
              message.includes('401') ||
              message.includes('403') ||
              message.includes('404')
            ) {
              return false;
            }
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
      },
    },
  });
