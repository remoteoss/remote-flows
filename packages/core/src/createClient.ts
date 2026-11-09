import { createClient as createHeyApiClient } from './client/client';
import { client } from './client/client.gen';

export type AuthResponse = {
  accessToken: string;
  expiresIn: number;
};

export type CreateClientOptions = {
  baseUrl?: string;
  proxy?: {
    url: string;
    headers?: {
      [key: string]: string;
    };
  };
  credentials?: RequestCredentials;
  version: string;
};

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function createClient(
  auth: (() => Promise<AuthResponse>) | undefined,
  options: CreateClientOptions,
) {
  const sessionRef = {
    current: null as { accessToken: string; expiresAt: number } | null,
  };

  const clientConfig = client.getConfig();

  const isValidProxy = !!options.proxy && isValidUrl(options.proxy.url);

  if (options.proxy && !isValidProxy) {
    console.error('Invalid proxy URL provided. Using default base URL.');
  }

  return createHeyApiClient({
    ...clientConfig,
    ...(options.credentials && { credentials: options.credentials }),
    headers: {
      ...clientConfig.headers,
      ...(isValidProxy ? options.proxy?.headers : {}),
      'X-Client-Name': 'remote-flows-sdk',
      'X-Client-Version': options.version,
    },
    baseUrl: isValidProxy ? options.proxy?.url : options.baseUrl,
    auth: async () => {
      if (!auth) {
        return undefined;
      }

      function hasTokenExpired(expiresAt: number | undefined) {
        return !expiresAt || Date.now() + 60000 > expiresAt;
      }

      if (
        !sessionRef.current ||
        hasTokenExpired(sessionRef.current.expiresAt)
      ) {
        try {
          const data = await auth();
          sessionRef.current = {
            accessToken: data.accessToken,
            expiresAt: Date.now() + data.expiresIn * 1000,
          };
        } catch (error) {
          console.error('Failed to fetch auth token:', error);
          return undefined;
        }
      }

      return sessionRef.current?.accessToken;
    },
  });
}
