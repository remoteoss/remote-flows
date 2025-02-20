import React, { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';
import type { SetNonNullable } from 'type-fest';

import { RemoteFlowsSDKProps } from './types';
import { client } from './client/client.gen';
import { clientCredentials } from './auth/clientCredentials.js';

const RemoteFlowSDKContext = createContext<RemoteFlowsSDKProps>({
  clientID: null,
  clientSecret: null,
});

export const useRemoteFlowsSDK = () => useContext(RemoteFlowSDKContext);

export function RemoteFlowsSDK({
  clientID,
  clientSecret,
  children,
}: PropsWithChildren<SetNonNullable<RemoteFlowsSDKProps>>) {
  if (!clientID || !clientSecret) {
    throw new Error('clientID and clientSecret are required');
  }

  client.setConfig({
    baseUrl: process.env.REMOTE_GATEWAY_URL,
    auth: async () => {
      return clientCredentials(clientID, clientSecret);
    },
  });

  return (
    <RemoteFlowSDKContext.Provider value={{ clientID, clientSecret }}>
      {children}
    </RemoteFlowSDKContext.Provider>
  );
}
