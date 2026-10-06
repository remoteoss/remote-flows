import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/tests/server';
import { useGPUpdatePersonalDetails } from '@/src/flows/PayrollEmployeeOnboarding/api';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

describe('useGPUpdatePersonalDetails', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('submits `name` instead of stripping it from the payload', async () => {
    let receivedBody: unknown;
    server.use(
      http.put('*/v1/employee/personal-details', async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ data: { status: 'ok' } });
      }),
    );

    const { result } = renderHook(
      () => useGPUpdatePersonalDetails('employment-1'),
      { wrapper: TestProviders },
    );

    result.current.mutate({ name: 'Jane Doe', given_name: 'Jane' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(receivedBody).toEqual({
      personal_details: { name: 'Jane Doe', given_name: 'Jane' },
    });
  });
});
