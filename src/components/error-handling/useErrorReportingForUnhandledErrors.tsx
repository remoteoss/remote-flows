import { reportTelemetryError } from '@/src/components/error-handling/telemetryService';
import { npmPackageVersion } from '@/src/lib/version';
import { useEffect } from 'react';
import { ErrorContextData } from '@/src/components/error-handling/types';
import { Environment } from '@/src/environments';
import { Client } from '@/src/client/client';

// WeakSet to track errors already handled by error boundaries
// Kept in module scope so it's shared across all hook instances
const handledErrors = new WeakSet<Error>();

/**
 * Marks an error as handled by an error boundary
 * This prevents duplicate reporting from the window error listener
 */
export function markErrorAsHandled(error: Error): void {
  handledErrors.add(error);
}

/**
 * Reports unhandled errors to the telemetry API.
 * @param errorContext - The error context.
 * @param environment - The environment to use for the API call.
 * @param debug - Whether to enable debug mode.
 */
export function useErrorReportingForUnhandledErrors(
  errorContext: ErrorContextData,
  environment: Environment,
  client: Client,
  debug: boolean,
) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error && handledErrors.has(event.error)) {
        if (debug) {
          console.log(
            '[RemoteFlows] Skipping already-handled error from window listener',
          );
        }
        return;
      }
      reportTelemetryError(
        event.error,
        npmPackageVersion,
        client,
        environment,
        errorContext,
        {
          debugMode: debug,
        },
      );
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      reportTelemetryError(
        error,
        npmPackageVersion,
        client,
        environment,
        errorContext,
        {
          debugMode: debug,
        },
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [errorContext, environment, client, debug]);
}
