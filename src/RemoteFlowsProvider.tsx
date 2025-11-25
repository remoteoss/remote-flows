import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';

import { ThemeProvider } from '@/src/theme';
import { FormFieldsContext, RemoteFlowContext } from './context';
import { Components, RemoteFlowsSDKProps } from './types/remoteFlows';
import { createClient } from '@/src/auth/createClient';
import { Client } from '@hey-api/client-fetch';

const queryClient = new QueryClient();

type RemoteFlowContextWrapperProps = {
  children: React.ReactNode;
  client: Client;
};

function RemoteFlowContextWrapper({
  children,
  client,
}: RemoteFlowContextWrapperProps) {
  return (
    <RemoteFlowContext.Provider value={{ client }}>
      {children}
    </RemoteFlowContext.Provider>
  );
}

export function FormFieldsProvider({
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
  theme,
  proxy,
  environment,
}: PropsWithChildren<RemoteFlowsSDKProps>) {
  const client = useMemo(
    () => createClient(auth, { environment, proxy }),
    [auth, environment, proxy],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <FormFieldsProvider components={components}>
        <RemoteFlowContextWrapper client={client}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </RemoteFlowContextWrapper>
      </FormFieldsProvider>
    </QueryClientProvider>
  );
}
