import { reportTelemetryError } from '@/src/components/error-handling/telemetryLogger';
import { npmPackageVersion } from '@/src/lib/version';
import { useEffect } from 'react';
import { ErrorContextData } from '@/src/components/error-handling/types';
import { Environment } from '@/src/environments';
import { Client } from '@hey-api/client-fetch';

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
