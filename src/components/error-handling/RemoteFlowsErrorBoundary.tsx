import { Component, ErrorInfo, ReactNode } from 'react';
import { reportTelemetryError } from '@/src/components/error-handling/telemetryService';
import { npmPackageVersion } from '@/src/lib/version';
import {
  ErrorContext,
  ErrorContextValue,
} from '@/src/components/error-handling/ErrorContext';
import { Environment } from '@/src/environments';
import { Client } from '@/src/client/client';

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

interface RemoteFlowsErrorBoundaryProps {
  children: ReactNode;
  /**
   * Debug mode to enable logging of errors to the console.
   * @default false
   */
  debug: boolean;
  /**
   * Environment to use for API calls.
   * If not provided, the SDK will use production environment.
   */
  environment?: Environment;

  /**
   * Client to use for API calls.
   * If not provided, the SDK will crash
   */
  client: Client;
  /**
   * Error boundary configuration.
   */
  errorBoundary?: {
    /**
     * If true, re-throws errors to parent error boundary.
     * If false, shows fallback UI to prevent crashes.
     * @default false
     */
    useParentErrorBoundary?: boolean;
    /**
     * Custom fallback UI to show when an error occurs.
     * fallback only works when rethrow is false.
     * If not provided, shows default error message.
     */
    fallback?: ReactNode | ((error: Error) => ReactNode);
  };
}

export const FallbackErrorBoundary = () => {
  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #dc2626',
        borderRadius: '4px',
        backgroundColor: '#fef2f2',
        color: '#991b1b',
      }}
    >
      Something went wrong in RemoteFlows. Please refresh the page.
    </div>
  );
};

export class RemoteFlowsErrorBoundary extends Component<
  RemoteFlowsErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: RemoteFlowsErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  static contextType = ErrorContext;
  declare context: ErrorContextValue | undefined;

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[RemoteFlows] Error caught:', error, errorInfo);

    const errorContext = this.context?.errorContextRef.current;
    const params = {
      error,
      sdkVersion: npmPackageVersion,
      client: this.props.client,
      environment: this.props.environment,
    };

    reportTelemetryError(params, errorContext, {
      debugMode: this.props.debug,
    });

    if (this.props.errorBoundary?.useParentErrorBoundary) {
      throw error;
    }
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // If custom fallback provided, use it
      if (this.props.errorBoundary?.fallback) {
        return typeof this.props.errorBoundary?.fallback === 'function'
          ? this.props.errorBoundary?.fallback(this.state.error)
          : this.props.errorBoundary?.fallback;
      }

      // Default fallback
      return <FallbackErrorBoundary />;
    }

    return this.props.children;
  }
}
