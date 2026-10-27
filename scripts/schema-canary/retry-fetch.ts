export const GATEWAY_RETRY_DELAYS_MS = [30_000, 120_000];

const RETRYABLE_SERVER_STATUSES = new Set([502, 503, 504]);

function isRetryable(response: Response) {
  const isGatewayBlock =
    response.status === 403 &&
    !response.headers.get('content-type')?.includes('json');
  return isGatewayBlock || RETRYABLE_SERVER_STATUSES.has(response.status);
}

export function retryOnGatewayError(
  baseFetch: typeof fetch = globalThis.fetch,
  retryDelaysMs: number[] = GATEWAY_RETRY_DELAYS_MS,
  sleep: (ms: number) => Promise<void> = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms)),
): typeof fetch {
  return async (input, init) => {
    const request = new Request(input, init);
    for (let attempt = 0; ; attempt++) {
      const response = await baseFetch(request.clone());
      if (attempt >= retryDelaysMs.length || !isRetryable(response)) {
        return response;
      }
      await sleep(retryDelaysMs[attempt]);
    }
  };
}
