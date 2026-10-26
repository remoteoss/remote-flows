export const GATEWAY_BLOCK_RETRY_DELAYS_MS = [30_000, 120_000];

function isGatewayBlock(response: Response) {
  return (
    response.status === 403 &&
    !response.headers.get('content-type')?.includes('json')
  );
}

export function retryOnGatewayBlock(
  baseFetch: typeof fetch,
  retryDelaysMs: number[] = GATEWAY_BLOCK_RETRY_DELAYS_MS,
  sleep: (ms: number) => Promise<void> = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms)),
): typeof fetch {
  return async (input, init) => {
    const request = new Request(input, init);
    for (let attempt = 0; ; attempt++) {
      const response = await baseFetch(request.clone());
      if (attempt >= retryDelaysMs.length || !isGatewayBlock(response)) {
        return response;
      }
      await sleep(retryDelaysMs[attempt]);
    }
  };
}
