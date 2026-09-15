import { act, renderHook } from '@testing-library/react';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { useContractDocument } from '@/src/flows/ContractDocument/hooks';

describe('useContractDocument', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('exposes the two-step shell', () => {
    const { result } = renderHook(() => useContractDocument(), {
      wrapper: TestProviders,
    });

    expect(result.current.stepState.currentStep.name).toBe('contract_details');
    expect(result.current.stepState.totalSteps).toBe(2);
    expect(result.current.steps).toEqual([
      { index: 0, name: 'contract_details', label: 'Contract Details' },
      { index: 1, name: 'contract_preview', label: 'Contract Preview' },
    ]);
    expect(result.current.fields).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('moves between steps with next, back and goTo', () => {
    const { result } = renderHook(() => useContractDocument(), {
      wrapper: TestProviders,
    });

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
