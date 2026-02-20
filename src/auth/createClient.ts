import { createClient as createHeyApiClient } from '@/src/client/client';
import { client } from '@/src/client/client.gen';
import { ENVIRONMENTS } from '@/src/environments';
import { npmPackageVersion } from '@/src/lib/version';
import { RemoteFlowsSDKProps } from '@/src/types/remoteFlows';
import { debug } from '@/src/lib/utils';

type AuthResponse = {
  accessToken: string;
  expiresIn: number;
};

type Options = Partial<{
  environment: keyof typeof ENVIRONMENTS;
  proxy: RemoteFlowsSDKProps['proxy'];
  credentials: RemoteFlowsSDKProps['credentials'];
}>;

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function createClient(
  auth?: () => Promise<AuthResponse>,
  options?: Options,
) {
  const sessionRef = {
    current: null as { accessToken: string; expiresAt: number } | null,
  };

  const baseUrl = options?.environment
    ? ENVIRONMENTS[options?.environment]
    : process.env.REMOTE_GATEWAY_URL;

  const clientConfig = client.getConfig();

  if (options?.environment && options?.environment !== 'production') {
    debug(npmPackageVersion);
  }

  const isValidProxy = !!options?.proxy && isValidUrl(options.proxy.url);

  if (options?.proxy && !isValidProxy) {
    console.error('Invalid proxy URL provided. Using default base URL.');
  }

  return createHeyApiClient({
    ...clientConfig,
    ...(options?.credentials && { credentials: options.credentials }),
    headers: {
      ...clientConfig.headers,
      ...(isValidProxy ? options?.proxy?.headers : {}),
      'X-Client-Name': 'remote-flows-sdk',
      'X-Client-Version': npmPackageVersion,
    },
    baseUrl: isValidProxy ? options.proxy?.url : baseUrl,
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
