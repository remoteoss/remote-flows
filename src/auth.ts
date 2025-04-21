import { client } from '@/src/client/client.gen';
import { ENVIRONMENTS } from '@/src/environments';
import { createClient } from '@hey-api/client-fetch';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';

type AuthResponse = {
  accessToken: string;
  expiresIn: number;
};

export const useAuth = ({
  auth,
  options,
}: {
  auth: () => Promise<AuthResponse>;
  options: { isTestingMode: boolean };
}) => {
  const session = useRef<{ accessToken: string; expiresAt: number } | null>(
    null,
  );
  const { refetch } = useQuery({
    queryKey: ['auth'],
    queryFn: auth,
    enabled: false,
  });

  const baseUrl = options.isTestingMode
    ? ENVIRONMENTS.partners
    : process.env.REMOTE_GATEWAY_URL;

  return useRef(
    createClient({
      ...client.getConfig(),
      baseUrl,
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
            };
          }
        }
        return session.current?.accessToken;
      },
    }),
  );
};
