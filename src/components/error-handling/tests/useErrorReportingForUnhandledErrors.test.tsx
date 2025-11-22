import { renderHook, waitFor } from '@testing-library/react';
import { useErrorReportingForUnhandledErrors } from '@/src/components/error-handling/useErrorReportingForUnhandledErrors';
import { reportTelemetryError } from '@/src/components/error-handling/telemetryLogger';

vi.mock('@/src/components/error-handling/telemetryLogger');
vi.mock('@/src/lib/version', () => ({ npmPackageVersion: '1.0.0' }));

describe('useErrorReportingForUnhandledErrors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should report uncaught errors', async () => {
    const errorContext = { flow: 'onboarding', step: 'basic_info' };
    renderHook(() => useErrorReportingForUnhandledErrors(errorContext, false));

    const error = new Error('Test error');
    window.dispatchEvent(new ErrorEvent('error', { error }));

    await waitFor(() => {
      expect(reportTelemetryError).toHaveBeenCalledWith(
        error,
        '1.0.0',
        errorContext,
        { debugMode: false },
      );
    });
  });

  it('should report unhandled promise rejections', async () => {
    const errorContext = { flow: 'termination' };
    renderHook(() => useErrorReportingForUnhandledErrors(errorContext, false));

    const error = new Error('Rejection');
    const event = new Event('unhandledrejection') as any;
    event.reason = error;
    event.promise = Promise.reject(error).catch(() => {}); // Catch to prevent actual unhandled rejection

    window.dispatchEvent(event);

    await waitFor(() => {
      expect(reportTelemetryError).toHaveBeenCalledWith(
        error,
        '1.0.0',
        errorContext,
        { debugMode: false },
      );
    });
  });

  it('should cleanup listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() =>
      useErrorReportingForUnhandledErrors({}, false),
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
