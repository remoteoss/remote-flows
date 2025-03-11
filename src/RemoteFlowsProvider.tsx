import { Client, createClient } from '@hey-api/client-fetch';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useRef } from 'react';

import { BaseTokenResponse } from './client';
import { client } from './client/client.gen';
import { RemoteFlowsSDKProps } from './types/remoteFlows';

const RemoteFlowContext = createContext<{ client: Client | null }>({
  client: null,
});

export const useClient = () => useContext(RemoteFlowContext);

export function RemoteFlows({
  auth,
  children,
}: PropsWithChildren<RemoteFlowsSDKProps>) {
  const session = useRef<BaseTokenResponse | null>(null);
  const remoteApiClient = useRef(
    createClient({
      ...client.getConfig(),
      baseUrl: process.env.REMOTE_GATEWAY_URL,
      auth: async () => {
        function hasTokenExpired(expiresAt: number | undefined) {
          return !expiresAt || Date.now() + 60000 > expiresAt;
        }

        if (!session.current || hasTokenExpired(session.current.expires_in)) {
          try {
            session.current = await auth();
          } catch {
            console.error('Failed to fetch the access token');
            return '';
          }
        }
        return session.current?.access_token;
      },
    }),
  );

  return (
    <RemoteFlowContext.Provider value={{ client: remoteApiClient.current }}>
      {children}
    </RemoteFlowContext.Provider>
  );
}
