import { retryOnGatewayBlock } from './retry-fetch';

const cloudFrontBlock = () =>
  new Response(
    '<HTML><HEAD><TITLE>ERROR: The request could not be satisfied</TITLE></HEAD></HTML>',
    { status: 403, headers: { 'content-type': 'text/html' } },
  );

describe('retryOnGatewayBlock', () => {
  it('retries a CloudFront block after each delay and returns the first good response', async () => {
    const baseFetch = vi
      .fn<typeof fetch>()
      .mockImplementationOnce(async () => cloudFrontBlock())
      .mockImplementationOnce(async () => cloudFrontBlock())
      .mockImplementationOnce(async () => new Response('{"ok":true}'));
    const sleep = vi.fn(async () => {});

    const response = await retryOnGatewayBlock(
      baseFetch,
      [10, 20],
      sleep,
    )('https://gateway.test/v1/employments', {
      method: 'PATCH',
      body: '{"a":1}',
    });

    expect(await response.text()).toBe('{"ok":true}');
    expect(baseFetch).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls).toEqual([[10], [20]]);
    const bodies = await Promise.all(
      baseFetch.mock.calls.map(([request]) => (request as Request).text()),
    );
    expect(bodies).toEqual(['{"a":1}', '{"a":1}', '{"a":1}']);
  });

  it('gives up after the last delay and returns the block response', async () => {
    const baseFetch = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => cloudFrontBlock());
    const sleep = vi.fn(async () => {});

    const response = await retryOnGatewayBlock(
      baseFetch,
      [10],
      sleep,
    )('https://gateway.test/v1/countries');

    expect(response.status).toBe(403);
    expect(baseFetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry an API error that is not a CloudFront block', async () => {
    const baseFetch = vi.fn<typeof fetch>().mockImplementation(
      async () =>
        new Response('{"message":"contract is required"}', {
          status: 422,
          headers: { 'content-type': 'application/json' },
        }),
    );
    const sleep = vi.fn(async () => {});

    const response = await retryOnGatewayBlock(
      baseFetch,
      [10, 20],
      sleep,
    )('https://gateway.test/v1/employments');

    expect(response.status).toBe(422);
    expect(baseFetch).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it('does not retry a JSON 403 from the API', async () => {
    const baseFetch = vi.fn<typeof fetch>().mockImplementation(
      async () =>
        new Response('{"message":"forbidden"}', {
          status: 403,
          headers: { 'content-type': 'application/json' },
        }),
    );
    const sleep = vi.fn(async () => {});

    const response = await retryOnGatewayBlock(
      baseFetch,
      [10, 20],
      sleep,
    )('https://gateway.test/v1/employments');

    expect(response.status).toBe(403);
    expect(baseFetch).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });
});
