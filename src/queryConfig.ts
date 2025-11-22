import { reportTelemetryError } from '@/src/components/error-handling/telemetryLogger';
import { npmPackageVersion } from '@/src/lib/version';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

export const getQueryClient = (debug: boolean) =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof Error) {
          reportTelemetryError(error, npmPackageVersion, undefined, {
            debugMode: debug,
          });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (error instanceof Error) {
          reportTelemetryError(error, npmPackageVersion, undefined, {
            debugMode: debug,
          });
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
