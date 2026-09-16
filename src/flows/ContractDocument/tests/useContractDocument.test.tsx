import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { useContractDocument } from '@/src/flows/ContractDocument/hooks';

describe('useContractDocument', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('does not pass a failed contract-documents load off as an empty list', async () => {
    server.use(
      http.get('*/v1/employments/:id/contract-documents', () =>
        HttpResponse.json({ message: 'Forbidden' }, { status: 403 }),
      ),
    );

    const { result } = renderHook(
      () => useContractDocument({ employmentId: 'employment-grace' }),
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.contractDocuments).toBeUndefined();
  });
});
