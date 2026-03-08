import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import React, { useMemo, useRef } from 'react';

import { ThemeProvider } from '@/src/theme';
import { FormFieldsContext, RemoteFlowContext } from './context';
import { Components, RemoteFlowsSDKProps } from './types/remoteFlows';
import { createClient } from '@/src/auth/createClient';
import { Client } from '@/src/client/client';
import { RemoteFlowsErrorBoundary } from '@/src/components/error-handling/RemoteFlowsErrorBoundary';
import { getQueryClient } from '@/src/queryConfig';
import { ErrorContextProvider } from '@/src/components/error-handling/ErrorContext';

type RemoteFlowContextWrapperProps = {
  children: React.ReactNode;
  environment?: RemoteFlowsSDKProps['environment'];
  debug?: RemoteFlowsSDKProps['debug'];
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
  components: Components;
}>) {
  const value = useMemo(() => ({ components }), [components]);
  return (
    <FormFieldsContext.Provider value={value}>
      {children}
    </FormFieldsContext.Provider>
  );
}

const queryClient = getQueryClient();

export function RemoteFlows({
  auth,
  children,
  components,
  theme,
  proxy,
  environment,
  errorBoundary = { useParentErrorBoundary: true },
  debug = false,
  credentials,
}: PropsWithChildren<RemoteFlowsSDKProps>) {
  const remoteApiClient = useRef(
    createClient(auth, { proxy, environment, credentials }),
  ).current;

  return (
    <ErrorContextProvider>
      <RemoteFlowsErrorBoundary
        errorBoundary={errorBoundary}
        debug={debug}
        environment={environment}
        client={remoteApiClient}
      >
        <QueryClientProvider client={queryClient}>
          <FormFieldsProvider components={components}>
            <RemoteFlowContextWrapper
              environment={environment}
              debug={debug}
              client={remoteApiClient}
            >
              <ThemeProvider theme={theme}>{children}</ThemeProvider>
            </RemoteFlowContextWrapper>
          </FormFieldsProvider>
        </QueryClientProvider>
      </RemoteFlowsErrorBoundary>
    </ErrorContextProvider>
  );
}
