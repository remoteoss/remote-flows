import { createClient } from '@hey-api/client-fetch';
import { BaseTokenResponse } from '../client';
import { stringToBase64 } from '../utils/encoding';

const clientCredentialsClient = createClient({
  baseUrl: 'https://gateway.niceremote.com',
});

let session: BaseTokenResponse = {};

function hasTokenExpired(expiresAt: number | undefined) {
  return !expiresAt || Date.now() + 60000 > expiresAt;
}

export async function clientCredentials(
  clientID: string,
  clientSecret: string,
) {
  const encodedCredentials = stringToBase64([clientID, clientSecret].join(':'));

  if (!session || hasTokenExpired(session.expires_in)) {
    const res = await clientCredentialsClient.post<BaseTokenResponse>({
      url: '/auth/oauth2/token',
      body: {
        grant_type: 'client_credentials',
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${encodedCredentials}`,
      },
    });

    if (!res.data) {
      throw new Error('Failed to fetch token');
    }

    if (res.response.status < 200 || res.response.status >= 300) {
      throw new Error('Unexpected status code');
    }

    session = {
      ...res.data,
      ...(res.data.expires_in && {
        expires_in: Date.now() + res.data.expires_in * 1000,
      }),
    };
  }

  return session.access_token;
}
