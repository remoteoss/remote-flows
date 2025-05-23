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
  isTestingMode?: RemoteFlowsSDKProps['isTestingMode'];
  proxy?: RemoteFlowsSDKProps['proxy'];
};

function RemoteFlowContextWrapper({
  children,
  auth,
  isTestingMode,
  proxy,
}: RemoteFlowContextWrapperProps) {
  const remoteApiClient = useAuth({
    auth,
    options: {
      isTestingMode: !!isTestingMode,
      proxy,
    },
  });
  return (
    <RemoteFlowContext.Provider value={{ client: remoteApiClient.current }}>
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
  isTestingMode = false,
  theme,
  proxy,
}: PropsWithChildren<RemoteFlowsSDKProps>) {
  return (
    <QueryClientProvider client={queryClient}>
      <FormFieldsProvider components={components}>
        <RemoteFlowContextWrapper
          isTestingMode={isTestingMode}
          auth={auth}
          proxy={proxy}
        >
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </RemoteFlowContextWrapper>
      </FormFieldsProvider>
    </QueryClientProvider>
  );
}
