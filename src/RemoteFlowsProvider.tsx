import { Client, createClient } from '@hey-api/client-fetch';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useRef } from 'react';

import { ENVIROMENTS } from '@/src/environments';
import { ThemeProvider } from '@/src/theme';
import { client } from './client/client.gen';
import { Components, RemoteFlowsSDKProps } from './types/remoteFlows';

const queryClient = new QueryClient();

const RemoteFlowContext = createContext<{ client: Client | null }>({
  client: null,
});

export const useClient = () => useContext(RemoteFlowContext);

type RemoteFlowContextWrapperProps = {
  auth: RemoteFlowsSDKProps['auth'];
  children: React.ReactNode;
  isTestingMode?: RemoteFlowsSDKProps['isTestingMode'];
};

function RemoteFlowContextWrapper({
  children,
  auth,
  isTestingMode,
}: RemoteFlowContextWrapperProps) {
  const session = useRef<{ accessToken: string; expiresAt: number } | null>(
    null,
  );
  const { refetch } = useQuery({
    queryKey: ['auth'],
    queryFn: auth,
    enabled: false,
  });

  const baseUrl = isTestingMode
    ? ENVIROMENTS.partners
    : process.env.REMOTE_GATEWAY_URL;

  const remoteApiClient = useRef(
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
  return (
    <RemoteFlowContext.Provider value={{ client: remoteApiClient.current }}>
      {children}
    </RemoteFlowContext.Provider>
  );
}

const FormFieldsContext = createContext<{ components: Components } | null>(
  null,
);

export const useFormFields = () => {
  const context = useContext(FormFieldsContext);
  if (!context?.components) {
    throw new Error('useFormFields must be used within a FormFieldsProvider');
  }

  return {
    components: context.components,
  };
};

function FormFieldsProvider({
  children,
  components,
}: PropsWithChildren<{
  components?: Components;
}>) {
  return (
    <FormFieldsContext.Provider
      value={components ? { components } : { components: {} }}
    >
      {children}
    </FormFieldsContext.Provider>
  );
}

export function RemoteFlows({
  auth,
  children,
  components,
  isTestingMode = false,
  theme,
}: PropsWithChildren<RemoteFlowsSDKProps>) {
  return (
    <QueryClientProvider client={queryClient}>
      <FormFieldsProvider components={components}>
        <RemoteFlowContextWrapper isTestingMode={isTestingMode} auth={auth}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </RemoteFlowContextWrapper>
      </FormFieldsProvider>
    </QueryClientProvider>
  );
}
