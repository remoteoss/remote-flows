import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { ThemeProvider } from '@/src/theme';
import { useAuth } from './auth';
import { FormFieldsContext, RemoteFlowContext } from './context';
import { Components, RemoteFlowsSDKProps } from './types/remoteFlows';

const queryClient = new QueryClient();

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
  const remoteApiClient = useAuth({
    auth,
    options: {
      isTestingMode: !!isTestingMode,
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
