import { renderHook, waitFor } from '@testing-library/react';
import { useErrorReportingForUnhandledErrors } from '@/src/components/error-handling/useErrorReportingForUnhandledErrors';
import { reportTelemetryError } from '@/src/components/error-handling/telemetryLogger';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { client } from '@/src/tests/testHelpers';

vi.mock('@/src/components/error-handling/telemetryLogger');
vi.mock('@/src/lib/version', () => ({ npmPackageVersion: '1.0.0' }));

describe('useErrorReportingForUnhandledErrors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should report uncaught errors', async () => {
    const errorContext = { flow: 'onboarding', step: 'basic_info' };
    renderHook(() =>
      useErrorReportingForUnhandledErrors(
        errorContext,
        'production',
        client,
        false,
      ),
    );

    const error = new Error('Test error');
    window.dispatchEvent(new ErrorEvent('error', { error }));

    await waitFor(() => {
      expect(reportTelemetryError).toHaveBeenCalledWith(
        error,
        '1.0.0',
        client,
        'production',
        errorContext,
        { debugMode: false },
      );
    });
  });

  it('should report unhandled promise rejections', async () => {
    const errorContext = { flow: 'termination' };
    renderHook(() =>
      useErrorReportingForUnhandledErrors(
        errorContext,
        'production',
        client,
        false,
      ),
    );

    const error = new Error('Rejection');
    const event = new Event('unhandledrejection') as $TSFixMe;
    event.reason = error;
    event.promise = Promise.reject(error).catch(() => {}); // Catch to prevent actual unhandled rejection

    window.dispatchEvent(event);

    await waitFor(() => {
      expect(reportTelemetryError).toHaveBeenCalledWith(
        error,
        '1.0.0',
        client,
        'production',
        errorContext,
        { debugMode: false },
      );
    });
  });

  it('should cleanup listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() =>
      useErrorReportingForUnhandledErrors({}, 'production', client, false),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'error',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'unhandledrejection',
      expect.any(Function),
    );
  });
});
