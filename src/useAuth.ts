import { client } from '@/src/client/client.gen';
import { ENVIRONMENTS } from '@/src/environments';
import { createClient } from '@hey-api/client-fetch';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { RemoteFlowsSDKProps } from './types/remoteFlows';
import { debug } from './lib/utils';

type AuthResponse = {
  accessToken: string;
  expiresIn: number;
  ownerId?: string;
};

type Options = Partial<{
  environment: keyof typeof ENVIRONMENTS;
  proxy: RemoteFlowsSDKProps['proxy'];
}>;

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export const useAuth = ({
  auth,
  options,
  authId = 'default',
}: {
  auth: () => Promise<AuthResponse>;
  options?: Options;
  authId?: 'default' | 'client';
}) => {
  const [ownerId, setOwnerId] = useState<string | undefined>();

  const session = useRef<{
    accessToken: string;
    expiresAt: number;
    ownerId?: string;
  } | null>(null);
  const { refetch } = useQuery({
    queryKey: ['auth', authId],
    queryFn: async () => {
      const data = await auth();
      console.log('data', data);
      setOwnerId(data.ownerId);
      return data;
    },
    enabled: false,
  });

  const baseUrl = options?.environment
    ? ENVIRONMENTS[options?.environment]
    : process.env.REMOTE_GATEWAY_URL;

  const clientConfig = client.getConfig();
  const npmPackageVersion = process.env.VERSION || 'unknown';

  if (options?.environment && options?.environment !== 'production') {
    debug(npmPackageVersion);
  }

  const isValidProxy = !!options?.proxy && isValidUrl(options.proxy.url);

  if (options?.proxy && !isValidProxy) {
    console.error('Invalid proxy URL provided. Using default base URL.');
  }

  return {
    client: useRef(
      createClient({
        ...clientConfig,
        headers: {
          ...clientConfig.headers,
          ...(isValidProxy ? options?.proxy?.headers : {}),
          'X-Client-Name': 'remote-flows-sdk',
          'X-Client-Version': npmPackageVersion,
        },
        baseUrl: isValidProxy ? options.proxy?.url : baseUrl,
        auth: async () => {
          function hasTokenExpired(expiresAt: number | undefined) {
            return !expiresAt || Date.now() + 60000 > expiresAt;
          }
          if (!session.current || hasTokenExpired(session.current.expiresAt)) {
            const { data } = await refetch();
            if (data) {
              session.current = {
                accessToken: data.accessToken,
                expiresAt: Date.now() + data.expiresIn * 1000,
                ownerId: data.ownerId,
              };
            }
          }
          return session.current?.accessToken;
        },
      }),
    ),
    ownerId,
  };
};
