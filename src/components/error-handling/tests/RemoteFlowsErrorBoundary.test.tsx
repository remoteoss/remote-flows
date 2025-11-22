import React from 'react';
import { render, screen } from '@testing-library/react';
import { RemoteFlowsErrorBoundary } from '../RemoteFlowsErrorBoundary';

const ErrorThrowingComponent = () => {
  throw new Error('Test error from child component');
};

const NormalComponent = () => {
  return <div>Normal content</div>;
};

describe('RemoteFlowsErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <RemoteFlowsErrorBoundary>
        <NormalComponent />
      </RemoteFlowsErrorBoundary>,
    );
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('should show default fallback UI when error occurs (default behavior)', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <RemoteFlowsErrorBoundary>
        <ErrorThrowingComponent />
      </RemoteFlowsErrorBoundary>,
    );

    // Should show default fallback (doesn't re-throw by default)
    expect(
      screen.getByText(/Something went wrong in RemoteFlows/),
    ).toBeInTheDocument();

    // Should log for Datadog
    const remoteFlowsCalls = consoleErrorSpy.mock.calls.filter(
      (call) => call[0] === '[RemoteFlows] Error caught:',
    );
    expect(remoteFlowsCalls).toHaveLength(1);
    expect(remoteFlowsCalls[0][1]).toMatchObject({
      message: 'Test error from child component',
    });
  });

  it('should show custom static fallback when provided', () => {
    render(
      <RemoteFlowsErrorBoundary
        errorBoundary={{
          fallback: <div>Custom error message</div>,
        }}
      >
        <ErrorThrowingComponent />
      </RemoteFlowsErrorBoundary>,
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should show custom function fallback with error details', () => {
    render(
      <RemoteFlowsErrorBoundary
        errorBoundary={{
          fallback: (error) => <div>Error: {error.message}</div>,
        }}
      >
        <ErrorThrowingComponent />
      </RemoteFlowsErrorBoundary>,
    );

    expect(
      screen.getByText('Error: Test error from child component'),
    ).toBeInTheDocument();
  });

  it('should re-throw to parent error boundary when rethrow=true', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ParentErrorBoundary>
        <RemoteFlowsErrorBoundary errorBoundary={{ rethrow: true }}>
          <ErrorThrowingComponent />
        </RemoteFlowsErrorBoundary>
      </ParentErrorBoundary>,
    );

    // Parent error boundary shows its UI
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // RemoteFlowsErrorBoundary should still log before re-throwing
    const remoteFlowsCalls = consoleErrorSpy.mock.calls.filter(
      (call) => call[0] === '[RemoteFlows] Error caught:',
    );
    expect(remoteFlowsCalls).toHaveLength(1);
  });

  it('should crash when rethrow=true and no parent boundary', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      render(
        <RemoteFlowsErrorBoundary errorBoundary={{ rethrow: true }}>
          <ErrorThrowingComponent />
        </RemoteFlowsErrorBoundary>,
      );
    }).toThrow('Test error from child component');

    // Should still log before crashing
    const remoteFlowsCalls = consoleErrorSpy.mock.calls.filter(
      (call) => call[0] === '[RemoteFlows] Error caught:',
    );
    expect(remoteFlowsCalls).toHaveLength(1);
  });

  it('should not crash when no parent boundary and rethrow=false (default)', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Should NOT throw - shows fallback instead
    expect(() => {
      render(
        <RemoteFlowsErrorBoundary>
          <ErrorThrowingComponent />
        </RemoteFlowsErrorBoundary>,
      );
    }).not.toThrow();

    // Should show fallback UI
    expect(
      screen.getByText(/Something went wrong in RemoteFlows/),
    ).toBeInTheDocument();

    // Should still log
    const remoteFlowsCalls = consoleErrorSpy.mock.calls.filter(
      (call) => call[0] === '[RemoteFlows] Error caught:',
    );
    expect(remoteFlowsCalls).toHaveLength(1);
  });

  it('should always call componentDidCatch for logging to Datadog', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <RemoteFlowsErrorBoundary>
        <ErrorThrowingComponent />
      </RemoteFlowsErrorBoundary>,
    );

    // Verify componentDidCatch was called (this is where Datadog will be)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[RemoteFlows] Error caught:',
      expect.objectContaining({ message: 'Test error from child component' }),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });

  it('should render FallbackErrorBoundary component as default fallback', () => {
    render(
      <RemoteFlowsErrorBoundary>
        <ErrorThrowingComponent />
      </RemoteFlowsErrorBoundary>,
    );

    // Verify the FallbackErrorBoundary renders
    expect(
      screen.getByText(
        'Something went wrong in RemoteFlows. Please refresh the page.',
      ),
    ).toBeInTheDocument();
  });

  it('should prefer custom fallback over default FallbackErrorBoundary', () => {
    render(
      <RemoteFlowsErrorBoundary
        errorBoundary={{
          fallback: <div>My custom fallback</div>,
        }}
      >
        <ErrorThrowingComponent />
      </RemoteFlowsErrorBoundary>,
    );

    // Should show custom fallback, not default
    expect(screen.getByText('My custom fallback')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Something went wrong in RemoteFlows. Please refresh the page.',
      ),
    ).not.toBeInTheDocument();
  });
});

// Parent error boundary (simulates customer's error boundary)
class ParentErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Silently catch for testing
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}
