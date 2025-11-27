import { createClient } from '@/src/auth/createClient';
import { $TSFixMe } from '@/src/types/remoteFlows';

vi.mock('@/src/client/client', () => ({
  createClient: vi.fn((config) => ({
    ...config,
    auth: config.auth,
  })),
}));

vi.mock('@/src/client/client.gen', () => ({
  client: {
    getConfig: vi.fn(() => ({
      headers: {},
    })),
  },
}));

vi.mock('@/src/lib/version', () => ({
  npmPackageVersion: '1.0.0',
}));

vi.mock('@/src/lib/utils', () => ({
  debug: vi.fn(),
}));

describe('createClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should cache tokens and reuse them within expiry window', async () => {
    const mockAuth = vi.fn().mockResolvedValue({
      accessToken: 'token-123',
      expiresIn: 3600,
    });

    const heyApiClient = createClient(mockAuth);
    const authCallback = (heyApiClient as $TSFixMe).auth;

    const token1 = await authCallback();
    const token2 = await authCallback();

    expect(mockAuth).toHaveBeenCalledTimes(1);
    expect(token1).toBe('token-123');
    expect(token2).toBe('token-123');
  });

  it('should fetch new token after expiry', async () => {
    const mockAuth = vi
      .fn()
      .mockResolvedValueOnce({ accessToken: 'token-1', expiresIn: 3600 })
      .mockResolvedValueOnce({ accessToken: 'token-2', expiresIn: 3600 });

    const heyApiClient = createClient(mockAuth);
    const authCallback = (heyApiClient as $TSFixMe).auth;

    await authCallback();
    vi.advanceTimersByTime((3600 + 60) * 1000); // Past expiry + 60s buffer
    const token2 = await authCallback();

    expect(mockAuth).toHaveBeenCalledTimes(2);
    expect(token2).toBe('token-2');
  });

  it('should return undefined if auth callback fails', async () => {
    const mockAuth = vi.fn().mockRejectedValue(new Error('Auth failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const heyApiClient = createClient(mockAuth);
    const authCallback = (heyApiClient as $TSFixMe).auth;

    const token = await authCallback();

    expect(token).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
