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
});
