import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { useContractDocument } from '@/src/flows/ContractDocument/hooks';

describe('useContractDocument', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('exposes the two-step shell for the given contractor', async () => {
    const { result } = renderHook(
      () => useContractDocument({ employmentId: 'employment-grace' }),
      { wrapper: TestProviders },
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.employmentId).toBe('employment-grace');
    expect(result.current.employment?.id).toBe('employment-grace');
    expect(result.current.isContractorOfRecord).toBe(false);
    expect(result.current.contractDocuments).toEqual([]);
    expect(result.current.stepState.currentStep.name).toBe('contract_details');
    expect(result.current.stepState.totalSteps).toBe(2);
    expect(result.current.steps).toEqual([
      { index: 0, name: 'contract_details', label: 'Contract Details' },
      { index: 1, name: 'contract_preview', label: 'Contract Preview' },
    ]);
    expect(result.current.fields).toEqual([]);
    expect(result.current.isSubmitting).toBe(false);
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

  it('moves between steps with next, back and goTo', () => {
    const { result } = renderHook(
      () => useContractDocument({ employmentId: 'employment-grace' }),
      { wrapper: TestProviders },
    );

    act(() => result.current.next());
    expect(result.current.stepState.currentStep.name).toBe('contract_preview');

    act(() => result.current.next());
    expect(result.current.stepState.currentStep.name).toBe('contract_preview');

    act(() => result.current.back());
    expect(result.current.stepState.currentStep.name).toBe('contract_details');

    act(() => result.current.goTo('contract_preview'));
    expect(result.current.stepState.currentStep.name).toBe('contract_preview');
  });
});
