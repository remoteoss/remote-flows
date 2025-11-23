import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { ThemeProvider } from '@/src/theme';
import { FormFieldsContext, RemoteFlowContext } from './context';
import { Components, RemoteFlowsSDKProps } from './types/remoteFlows';
import { useAuth } from './useAuth';
import { RemoteFlowsErrorBoundary } from '@/src/components/error-handling/RemoteFlowsErrorBoundary';
import {
  ErrorContextProvider,
  useErrorContext,
} from '@/src/components/error-handling/ErrorContext';
import { getQueryClient } from '@/src/queryConfig';
import { useErrorReportingForUnhandledErrors } from '@/src/components/error-handling/useErrorReportingForUnhandledErrors';
import { Client } from '@hey-api/client-fetch';

type RemoteFlowContextWrapperProps = {
  children: React.ReactNode;
  environment?: RemoteFlowsSDKProps['environment'];
  debug?: RemoteFlowsSDKProps['debug'];
  client: Client;
};

function RemoteFlowContextWrapper({
  children,
  environment,
  debug,
  client,
}: RemoteFlowContextWrapperProps) {
  const { errorContext } = useErrorContext();
  useErrorReportingForUnhandledErrors(
    errorContext,
    environment ?? 'production',
    client,
    Boolean(debug),
  );

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
  authId,
  children,
  components,
  theme,
  proxy,
  environment,
  errorBoundary = { useParentErrorBoundary: true },
  debug = false,
}: PropsWithChildren<RemoteFlowsSDKProps>) {
  const remoteApiClient = useAuth({
    auth,
    authId,
    options: {
      proxy,
      environment,
    },
  });
  const queryClient = getQueryClient(
    debug,
    remoteApiClient.current,
    environment,
  );

  return (
    <ErrorContextProvider>
      <RemoteFlowsErrorBoundary
        errorBoundary={errorBoundary}
        debug={debug}
        environment={environment}
        client={remoteApiClient.current}
      >
        <QueryClientProvider client={queryClient}>
          <FormFieldsProvider components={components}>
            <RemoteFlowContextWrapper
              environment={environment}
              debug={debug}
              client={remoteApiClient.current}
            >
              <ThemeProvider theme={theme}>{children}</ThemeProvider>
            </RemoteFlowContextWrapper>
          </FormFieldsProvider>
        </QueryClientProvider>
      </RemoteFlowsErrorBoundary>
    </ErrorContextProvider>
  );
}
