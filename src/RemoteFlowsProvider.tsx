import { Client, createClient } from '@hey-api/client-fetch';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useRef } from 'react';

import { client } from './client/client.gen';
import { RemoteFlowsSDKProps } from './types/remoteFlows';

const queryClient = new QueryClient();

const RemoteFlowContext = createContext<{ client: Client | null }>({
  client: null,
});

export const useClient = () => useContext(RemoteFlowContext);

type RemoteFlowContextWrapperProps = {
  auth: RemoteFlowsSDKProps['auth'];
  children: React.ReactNode;
};

function RemoteFlowContextWrapper({
  children,
  auth,
}: RemoteFlowContextWrapperProps) {
  const session = useRef<{ accessToken: string; expiresAt: number } | null>(
    null,
  );
  const { refetch } = useQuery({
    queryKey: ['auth'],
    queryFn: auth,
    enabled: false,
  });
  const remoteApiClient = useRef(
    createClient({
      ...client.getConfig(),
      baseUrl: process.env.REMOTE_GATEWAY_URL,
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
  return (
    <RemoteFlowContext.Provider value={{ client: remoteApiClient.current }}>
      {children}
    </RemoteFlowContext.Provider>
  );
}

export function RemoteFlows({
  auth,
  children,
}: PropsWithChildren<RemoteFlowsSDKProps>) {
  return (
    <QueryClientProvider client={queryClient}>
      <RemoteFlowContextWrapper auth={auth}>
        {children}
      </RemoteFlowContextWrapper>
    </QueryClientProvider>
  );
}
