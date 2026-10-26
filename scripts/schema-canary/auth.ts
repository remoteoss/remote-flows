import { createClient } from '@/src/auth/createClient';
import { ENVIRONMENTS } from '@/src/environments';
import { Client } from '@/src/client/client';
import { retryOnGatewayBlock } from './retry-fetch';

export const SANDBOX_GATEWAY_URL = ENVIRONMENTS.sandbox;

export async function fetchSandboxAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<{ accessToken: string; expiresIn: number }> {
  const encodedCredentials = Buffer.from(
    `${clientId}:${clientSecret}`,
  ).toString('base64');

  const response = await retryOnGatewayBlock()(
    `${SANDBOX_GATEWAY_URL}/auth/oauth2/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedCredentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Sandbox auth failed: HTTP ${response.status}: ${errorText}`,
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

export function createSandboxClient(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Client {
  return createEnvClient(SANDBOX_GATEWAY_URL, () =>
    fetchSandboxAccessToken(clientId, clientSecret, refreshToken),
  );
}

export function createEnvClient(
  gatewayUrl: string,
  fetchAccessToken: () => Promise<{ accessToken: string; expiresIn?: number }>,
): Client {
  process.env.REMOTE_GATEWAY_URL = gatewayUrl;
  const client = createClient(async () => {
    const { accessToken, expiresIn } = await fetchAccessToken();
    return { accessToken, expiresIn: expiresIn ?? 3600 };
  });
  client.setConfig({ fetch: retryOnGatewayBlock() });
  return client;
}
