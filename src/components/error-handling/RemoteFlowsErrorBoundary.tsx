import { Component, ErrorInfo, ReactNode } from 'react';

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

interface RemoteFlowsErrorBoundaryProps {
  children: ReactNode;
  /**
   * Error boundary configuration.
   */
  errorBoundary?: {
    /**
     * If true, re-throws errors to parent error boundary.
     * If false, shows fallback UI to prevent crashes.
     */
    rethrow?: boolean;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[RemoteFlows] Error caught:', error, errorInfo);

    if (this.props.errorBoundary?.rethrow) {
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
