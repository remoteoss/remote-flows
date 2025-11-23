import { render, screen } from '@testing-library/react';
import React from 'react';
import { RemoteFlowsErrorBoundary } from '../RemoteFlowsErrorBoundary';
import { reportTelemetryError } from '../telemetryService';
import { ErrorContextProvider, useErrorContext } from '../ErrorContext';
import { client } from '@/src/tests/testHelpers';
vi.mock('../telemetryLogger');

const ErrorThrowingComponent = () => {
  throw new Error('Test error from child component');
};

const NormalComponent = () => {
  return <div>Normal content</div>;
};

const ComponentThatSetsContext = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { updateContext } = useErrorContext();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    updateContext({ flow: 'onboarding', step: 'basic_info' });
    setReady(true);
  }, [updateContext]);

  return ready ? <>{children}</> : null;
};

describe('RemoteFlowsErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <RemoteFlowsErrorBoundary
        client={client}
        environment='production'
        debug={false}
      >
        <NormalComponent />
      </RemoteFlowsErrorBoundary>,
    );
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('should catch errors and report telemetry', () => {
    render(
      <RemoteFlowsErrorBoundary
        client={client}
        environment='production'
        debug={false}
      >
        <ErrorThrowingComponent />
      </RemoteFlowsErrorBoundary>,
    );

    expect(reportTelemetryError).toHaveBeenCalledWith(
      new Error('Test error from child component'),
      'unknown',
      client,
      'production',
      undefined,
      {
        debugMode: false,
      },
    );
  });

  it('should show default fallback UI when error occurs', () => {
    render(
      <RemoteFlowsErrorBoundary
        client={client}
        environment='production'
        debug={false}
      >
        <ErrorThrowingComponent />
      </RemoteFlowsErrorBoundary>,
    );

    expect(
      screen.getByText(/Something went wrong in RemoteFlows/),
    ).toBeInTheDocument();
  });

  it('should show custom fallback when provided', () => {
    render(
      <RemoteFlowsErrorBoundary
        client={client}
        environment='production'
        debug={false}
        errorBoundary={{
          fallback: <div>Custom error</div>,
        }}
      >
        <ErrorThrowingComponent />
      </RemoteFlowsErrorBoundary>,
    );

    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('should re-throw when useParentErrorBoundary=true', () => {
    expect(() => {
      render(
        <RemoteFlowsErrorBoundary
          client={client}
          environment='production'
          debug={false}
          errorBoundary={{ useParentErrorBoundary: true }}
        >
          <ErrorThrowingComponent />
        </RemoteFlowsErrorBoundary>,
      );
    }).toThrow('Test error from child component');
  });

  it('should pass error context to telemetry when available', () => {
    render(
      <ErrorContextProvider>
        <ComponentThatSetsContext>
          <RemoteFlowsErrorBoundary
            client={client}
            environment='production'
            debug={false}
          >
            <ErrorThrowingComponent />
          </RemoteFlowsErrorBoundary>
        </ComponentThatSetsContext>
      </ErrorContextProvider>,
    );

    expect(reportTelemetryError).toHaveBeenCalledWith(
      new Error('Test error from child component'),
      'unknown',
      client,
      'production',
      {
        flow: 'onboarding',
        step: 'basic_info',
      },
      {
        debugMode: false,
      },
    );
  });
});
