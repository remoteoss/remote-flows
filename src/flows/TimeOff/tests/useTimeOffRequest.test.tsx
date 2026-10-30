import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useTimeOffRequest } from '@/src/flows/TimeOff/hooks';
import { timeOffRequestResponse } from '@/src/flows/TimeOff/tests/fixtures';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

describe('useTimeOffRequest', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('loads the time-off request for the supplied ID', async () => {
    const requestedIds: string[] = [];
    server.use(
      http.get('*/v1/timeoff/:id', ({ params }) => {
        requestedIds.push(params.id as string);
        return HttpResponse.json(timeOffRequestResponse);
      }),
    );

    const { result } = renderHook(
      () => useTimeOffRequest({ timeOffId: 'timeoff-123' }),
      { wrapper: TestProviders },
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.timeOffRequest).toEqual(
        timeOffRequestResponse.data.timeoff,
      );
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(requestedIds).toEqual(['timeoff-123']);
  });

  it.each([
    [404, 'not_found', { error: { message: 'Not Found' } }],
    [401, 'unauthorized', { message: 'Unauthorized' }],
    [403, 'unauthorized', { message: 'Forbidden' }],
    [429, 'request_failed', { message: 'Too many requests' }],
    [500, 'request_failed', { message: 'Internal server error' }],
  ])('reports a %i response as %s', async (status, reason, body) => {
    server.use(
      http.get('*/v1/timeoff/:id', () => HttpResponse.json(body, { status })),
    );

    const { result } = renderHook(
      () => useTimeOffRequest({ timeOffId: 'timeoff-123' }),
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      expect(result.current.error).toEqual({ reason, status });
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.timeOffRequest).toBeUndefined();
  });

  it('recovers when a failed load is retried', async () => {
    let attempts = 0;
    server.use(
      http.get('*/v1/timeoff/:id', () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json({ message: 'Unavailable' }, { status: 503 })
          : HttpResponse.json(timeOffRequestResponse);
      }),
    );

    const { result } = renderHook(
      () => useTimeOffRequest({ timeOffId: 'timeoff-123' }),
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      expect(result.current.error).toEqual({
        reason: 'request_failed',
        status: 503,
      });
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.timeOffRequest).toEqual(
        timeOffRequestResponse.data.timeoff,
      );
    });
    expect(result.current.error).toBeNull();
  });

  it('stays idle without requesting anything while the ID is blank', () => {
    const requests: string[] = [];
    const onRequest = ({ request }: { request: Request }) => {
      requests.push(request.url);
    };
    server.events.on('request:start', onRequest);

    const { result } = renderHook(() => useTimeOffRequest({}), {
      wrapper: TestProviders,
    });

    server.events.removeListener('request:start', onRequest);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(requests).toEqual([]);
  });
});
