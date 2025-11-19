import React, { ReactElement, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactElement;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('RemoteFlows Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: '20px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#7f1d1d',
            }}
          >
            <h2 style={{ marginTop: 0 }}>Something went wrong</h2>
            <p>
              An error occurred in the RemoteFlows component. Please try
              refreshing the page.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
