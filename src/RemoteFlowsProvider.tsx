import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { ThemeProvider } from '@/src/theme';
import { FormFieldsContext, RemoteFlowContext } from './context';
import { Components, RemoteFlowsSDKProps } from './types/remoteFlows';
import { useAuth } from './useAuth';

const queryClient = new QueryClient();

type RemoteFlowContextWrapperProps = {
  auth: RemoteFlowsSDKProps['auth'];
  children: React.ReactNode;
  environment?: RemoteFlowsSDKProps['environment'];
  proxy?: RemoteFlowsSDKProps['proxy'];
  authId?: RemoteFlowsSDKProps['authId'];
};

function RemoteFlowContextWrapper({
  children,
  auth,
  authId,
  proxy,
  environment,
}: RemoteFlowContextWrapperProps) {
  const { client, userId } = useAuth({
    auth,
    authId,
    options: {
      proxy,
      environment,
    },
  });
  return (
    <RemoteFlowContext.Provider value={{ client: client.current, userId }}>
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
  authId,
  children,
  components,
  theme,
  proxy,
  environment,
}: PropsWithChildren<RemoteFlowsSDKProps>) {
  return (
    <QueryClientProvider client={queryClient}>
      <FormFieldsProvider components={components}>
        <RemoteFlowContextWrapper
          auth={auth}
          authId={authId}
          proxy={proxy}
          environment={environment}
        >
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </RemoteFlowContextWrapper>
      </FormFieldsProvider>
    </QueryClientProvider>
  );
}
