import { renderHook, waitFor } from '@testing-library/react';
import { useIdentity } from '@/src/index';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

describe('useIdentity', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('is exported from the package entry point and returns the current identity', async () => {
    const { result } = renderHook(() => useIdentity(), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toMatchObject({
      user: { id: 'ffabca18-20fc-489d-995b-bf76eebc6882' },
      company: { id: '754a654a-a442-469a-a5ec-267c9db3b268' },
    });
  });

  it('does not refetch when another observer mounts after it has loaded', async () => {
    const first = renderHook(() => useIdentity(), { wrapper: TestProviders });

    await waitFor(() => {
      expect(first.result.current.data).toBeDefined();
    });

    const second = renderHook(() => useIdentity(), { wrapper: TestProviders });

    expect(second.result.current.data).toBeDefined();
    expect(second.result.current.fetchStatus).toBe('idle');
    expect(queryClient.getQueryState(['identity'])?.dataUpdateCount).toBe(1);
  });
});
