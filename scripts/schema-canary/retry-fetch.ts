const GATEWAY_BLOCK_MARKER = 'The request could not be satisfied';

export const GATEWAY_BLOCK_RETRY_DELAYS_MS = [30_000, 120_000];

async function isGatewayBlock(response: Response) {
  if (response.ok) {
    return false;
  }
  const body = await response.clone().text();
  return body.includes(GATEWAY_BLOCK_MARKER);
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
      if (
        attempt >= retryDelaysMs.length ||
        !(await isGatewayBlock(response))
      ) {
        return response;
      }
      await sleep(retryDelaysMs[attempt]);
    }
  };
}
