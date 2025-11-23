import { renderHook, waitFor } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/tests/server';
import { TestProviders, client, queryClient } from '@/src/tests/testHelpers';
import { reportTelemetryError } from '@/src/components/error-handling/telemetryService';
import { useErrorContext } from '@/src/components/error-handling/ErrorContext';
import React from 'react';

vi.mock('@/src/components/error-handling/telemetryLogger');
vi.mock('@/src/lib/version', () => ({ npmPackageVersion: '1.0.0' }));

describe('queryConfig error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should report query errors with error context and metadata', async () => {
    server.use(
      http.get('*/api/test', () => {
        return HttpResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 },
        );
      }),
    );

    const { result } = renderHook(
      () => {
        const { updateContext } = useErrorContext();
        React.useEffect(() => {
          updateContext({ flow: 'onboarding', step: 'basic_info' });
        }, [updateContext]);

        return useQuery({
          queryKey: ['test-query'],
          queryFn: async () => {
            const response = await fetch('/api/test');
            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`,
              );
            }
            return response.json();
          },
          retry: false,
        });
      },
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    await waitFor(() => {
      expect(reportTelemetryError).toHaveBeenCalledWith(
        new Error('HTTP 500: Internal Server Error'),
        '1.0.0',
        client,
        'testing',
        {
          flow: 'onboarding',
          step: 'basic_info',
          metadata: {
            queryKey: JSON.stringify(['test-query']),
          },
        },
        { debugMode: false },
      );
    });
  });
});
