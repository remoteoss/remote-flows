import { PropsWithChildren } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { RemoteFlowContext } from '@/src/context';
import { client, queryClient, TestProviders } from '@/src/tests/testHelpers';
import { createClientMutation } from '@/src/lib/withClient';

const Wrapper = ({ children }: PropsWithChildren) => (
  <TestProviders>
    <RemoteFlowContext.Provider value={{ client }}>
      {children}
    </RemoteFlowContext.Provider>
  </TestProviders>
);

describe('createClientMutation', () => {
  afterEach(() => {
    queryClient.clear();
  });

  it('passes the context client and the extra arguments to the factory', () => {
    const factory = vi.fn(
      (_client: unknown, _countryCode: string, _version: number) => ({
        mutationFn: async (values: { name: string }) => ({
          data: values,
          error: null,
        }),
      }),
    );
    const useTestMutation = createClientMutation(factory);

    renderHook(() => useTestMutation('PRT', 2), { wrapper: Wrapper });

    expect(factory).toHaveBeenCalledWith(client, 'PRT', 2);
  });

  it('resolves mutateAsyncOrThrow with the unwrapped data', async () => {
    const useTestMutation = createClientMutation(() => ({
      mutationFn: async (values: { name: string }) => ({
        data: values,
        error: null,
      }),
    }));

    const { result } = renderHook(() => useTestMutation(), {
      wrapper: Wrapper,
    });

    await expect(
      result.current.mutateAsyncOrThrow({ name: 'Ana' }),
    ).resolves.toEqual({ name: 'Ana' });
    await waitFor(() => expect(result.current.isPending).toBe(false));
  });

  it('keeps mutateAsyncOrThrow stable across re-renders', () => {
    const useTestMutation = createClientMutation(() => ({
      mutationFn: async (values: { name: string }) => ({
        data: values,
        error: null,
      }),
    }));

    const { result, rerender } = renderHook(() => useTestMutation(), {
      wrapper: Wrapper,
    });
    const first = result.current.mutateAsyncOrThrow;

    rerender();

    expect(result.current.mutateAsyncOrThrow).toBe(first);
  });
});
