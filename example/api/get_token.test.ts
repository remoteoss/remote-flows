import { cacheUntilExpiry } from './get_token.js';

describe('cacheUntilExpiry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reuses the token until a minute before it expires', async () => {
    const requestToken = vi
      .fn()
      .mockResolvedValueOnce({ accessToken: 'first', expiresIn: 3600 })
      .mockResolvedValueOnce({ accessToken: 'second', expiresIn: 3600 });
    const fetchToken = cacheUntilExpiry(requestToken);

    expect(await fetchToken()).toEqual({
      accessToken: 'first',
      expiresIn: 3600,
    });
    vi.advanceTimersByTime(3539 * 1000);
    expect(await fetchToken()).toEqual({ accessToken: 'first', expiresIn: 61 });
    vi.advanceTimersByTime(1000);
    expect(await fetchToken()).toEqual({
      accessToken: 'second',
      expiresIn: 3600,
    });
    expect(requestToken).toHaveBeenCalledTimes(2);
  });

  it('makes one request for calls that arrive while it is pending', async () => {
    const requestToken = vi
      .fn()
      .mockResolvedValue({ accessToken: 'token', expiresIn: 3600 });
    const fetchToken = cacheUntilExpiry(requestToken);

    const [first, second] = await Promise.all([fetchToken(), fetchToken()]);

    expect(first.accessToken).toBe('token');
    expect(second.accessToken).toBe('token');
    expect(requestToken).toHaveBeenCalledTimes(1);
  });

  it('requests a new token after a failed request', async () => {
    const requestToken = vi
      .fn()
      .mockRejectedValueOnce(new Error('HTTP 500'))
      .mockResolvedValueOnce({ accessToken: 'token', expiresIn: 3600 });
    const fetchToken = cacheUntilExpiry(requestToken);

    await expect(fetchToken()).rejects.toThrow('HTTP 500');
    expect(await fetchToken()).toEqual({
      accessToken: 'token',
      expiresIn: 3600,
    });
    expect(requestToken).toHaveBeenCalledTimes(2);
  });
});
