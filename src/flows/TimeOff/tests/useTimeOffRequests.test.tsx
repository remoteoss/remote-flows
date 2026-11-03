import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useTimeOffRequests } from '@/src/flows/TimeOff/hooks';
import {
  emptyTimeOffRequestsResponse,
  timeOffRequestsResponse,
} from '@/src/flows/TimeOff/tests/fixtures';
import { UseTimeOffRequestsOptions } from '@/src/flows/TimeOff/types';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

describe('useTimeOffRequests', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('loads the requested time-off requests with the API paging defaults', async () => {
    const queries: string[] = [];
    server.use(
      http.get('*/v1/timeoff', ({ request }) => {
        queries.push(new URL(request.url).search);
        return HttpResponse.json(timeOffRequestsResponse);
      }),
    );

    const { result } = renderHook(() => useTimeOffRequests(), {
      wrapper: TestProviders,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.timeOffRequests).toEqual(
        timeOffRequestsResponse.data?.timeoffs,
      );
    });
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.totalCount).toBe(21);
    expect(result.current.error).toBeNull();
    expect(queries).toEqual(['?status=requested']);
  });

  it('reports an empty page', async () => {
    server.use(
      http.get('*/v1/timeoff', () =>
        HttpResponse.json(emptyTimeOffRequestsResponse),
      ),
    );

    const { result } = renderHook(() => useTimeOffRequests(), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(result.current.isEmpty).toBe(true);
    });
    expect(result.current.timeOffRequests).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it('loads each page and status it is given', async () => {
    const queries: string[] = [];
    server.use(
      http.get('*/v1/timeoff', ({ request }) => {
        const { search, searchParams } = new URL(request.url);
        queries.push(search);
        return HttpResponse.json({
          data: {
            ...timeOffRequestsResponse.data,
            current_page: Number(searchParams.get('page') ?? 1),
          },
        });
      }),
    );

    const { result, rerender } = renderHook<
      ReturnType<typeof useTimeOffRequests>,
      UseTimeOffRequestsOptions
    >((options) => useTimeOffRequests(options), {
      wrapper: TestProviders,
      initialProps: { page: 1, pageSize: 100 },
    });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(1);
    });

    rerender({ page: 2, pageSize: 100 });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(2);
    });

    rerender({ status: 'approved', page: 1, pageSize: 100 });

    await waitFor(() => {
      expect(queries).toHaveLength(3);
    });
    expect(queries).toEqual([
      '?status=requested&page=1&page_size=100',
      '?status=requested&page=2&page_size=100',
      '?status=approved&page=1&page_size=100',
    ]);
  });

  it.each([
    [400, 'rejected', { error: 'Bad Request' }],
    [422, 'rejected', { error: { message: 'Unprocessable Entity' } }],
    [401, 'unauthorized', { message: 'Unauthorized' }],
    [403, 'unauthorized', { message: 'Forbidden' }],
    [500, 'request_failed', { message: 'Internal server error' }],
  ])('reports a %i response as %s', async (status, reason, body) => {
    server.use(
      http.get('*/v1/timeoff', () => HttpResponse.json(body, { status })),
    );

    const { result } = renderHook(() => useTimeOffRequests(), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(result.current.error).toEqual({ reason, status });
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.timeOffRequests).toEqual([]);
  });

  it('recovers when a failed load is retried', async () => {
    let attempts = 0;
    server.use(
      http.get('*/v1/timeoff', () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json({ message: 'Unavailable' }, { status: 503 })
          : HttpResponse.json(timeOffRequestsResponse);
      }),
    );

    const { result } = renderHook(() => useTimeOffRequests(), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(result.current.error).toEqual({
        reason: 'request_failed',
        status: 503,
      });
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.timeOffRequests).toEqual(
        timeOffRequestsResponse.data?.timeoffs,
      );
    });
    expect(result.current.error).toBeNull();
  });
});
