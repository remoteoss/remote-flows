import { reportTelemetryError } from '@/src/components/error-handling/telemetryLogger';
import { npmPackageVersion } from '@/src/lib/version';
import { useEffect } from 'react';
import { ErrorContextData } from '@/src/components/error-handling/types';

export function useErrorReportingForUnhandledErrors(
  errorContext: ErrorContextData,
  debug: boolean,
) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      reportTelemetryError(event.error, npmPackageVersion, errorContext, {
        debugMode: debug,
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      reportTelemetryError(error, npmPackageVersion, errorContext, {
        debugMode: debug,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [errorContext, debug]);
}
