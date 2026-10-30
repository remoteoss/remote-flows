import { fetchSandboxAccessToken } from './auth';

const cloudFrontBlock = () =>
  new Response(
    '<HTML><HEAD><TITLE>ERROR: The request could not be satisfied</TITLE></HEAD></HTML>',
    { status: 403, headers: { 'content-type': 'text/html' } },
  );

describe('fetchSandboxAccessToken', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('retries a CloudFront block on the token request', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementationOnce(async () => cloudFrontBlock())
      .mockImplementationOnce(
        async () =>
          new Response('{"access_token":"abc","expires_in":3600}', {
            headers: { 'content-type': 'application/json' },
          }),
      );

    const tokenPromise = fetchSandboxAccessToken('id', 'secret', 'refresh');
    await vi.runAllTimersAsync();

    expect(await tokenPromise).toEqual({ accessToken: 'abc', expiresIn: 3600 });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('does not retry an auth failure that is not a CloudFront block', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () =>
        new Response('{"error":"invalid_grant"}', {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }),
    );

    await expect(
      fetchSandboxAccessToken('id', 'secret', 'refresh'),
    ).rejects.toThrow('Sandbox auth failed: HTTP 401');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
