import { renderHook, act, waitFor } from '@testing-library/react';
import { useErrorReporting } from '@/src/components/error-handling/useErrorReporting';
import { ErrorContextProvider } from '@/src/components/error-handling/ErrorContext';
import { PropsWithChildren } from 'react';

const wrapper = ({ children }: PropsWithChildren) => (
  <ErrorContextProvider>{children}</ErrorContextProvider>
);

describe('useErrorReporting', () => {
  it('should set initial error context', async () => {
    const initialContext = { flow: 'test-flow', step: 'basic_info' };

    const { result } = renderHook(() => useErrorReporting(initialContext), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.errorContext.current).toEqual(initialContext);
    });
  });

  it('should update error context', async () => {
    const { result } = renderHook(() => useErrorReporting({ flow: 'test' }), {
      wrapper,
    });

    act(() => {
      result.current.updateErrorContext({ step: 'contract_details' });
    });

    await waitFor(() => {
      expect(result.current.errorContext.current).toEqual({
        flow: 'test',
        step: 'contract_details',
      });
    });
  });

  it('should clear error context', async () => {
    const { result } = renderHook(
      () => useErrorReporting({ flow: 'test', step: 'basic_info' }),
      { wrapper },
    );

    act(() => {
      result.current.clearErrorContext();
    });

    await waitFor(() => {
      expect(result.current.errorContext.current).toEqual({});
    });
  });
});
