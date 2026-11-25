import { createClient } from './create-client';

type ConfigWithAuth = { auth: () => Promise<string | undefined> };

describe('createClient', () => {
  it('uses the token returned by the auth function', async () => {
    const auth = vi.fn().mockResolvedValue({
      accessToken: 'token-123',
      expiresIn: 3600,
    });

    const config = createClient({
      auth,
      environment: 'partners',
    }).getConfig() as unknown as ConfigWithAuth;

    expect(await config.auth()).toBe('token-123');
    expect(await config.auth()).toBe('token-123');
    expect(auth).toHaveBeenCalledTimes(1);
  });

  it('sends no token when neither auth nor a proxy is given', async () => {
    const config = createClient({
      environment: 'partners',
    }).getConfig() as unknown as ConfigWithAuth;

    expect(await config.auth()).toBeUndefined();
  });
});
