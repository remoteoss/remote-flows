import { createClient } from '@/src/auth/createClient';
import { ENVIRONMENTS } from '@/src/environments';
import { Client } from '@/src/client/client';

export const SANDBOX_GATEWAY_URL = ENVIRONMENTS.sandbox;

export async function fetchSandboxAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<{ accessToken: string; expiresIn: number }> {
  const encodedCredentials = Buffer.from(
    `${clientId}:${clientSecret}`,
  ).toString('base64');

  const response = await fetch(`${SANDBOX_GATEWAY_URL}/auth/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${encodedCredentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

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
  process.env.REMOTE_GATEWAY_URL = SANDBOX_GATEWAY_URL;
  return createClient(() =>
    fetchSandboxAccessToken(clientId, clientSecret, refreshToken),
  );
}
