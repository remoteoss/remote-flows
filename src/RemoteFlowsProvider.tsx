import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import React, { useMemo, Suspense, useRef } from 'react';

import { ThemeProvider } from '@/src/theme';
import { FormFieldsContext, RemoteFlowContext } from './context';
import { Components, RemoteFlowsSDKProps } from './types/remoteFlows';
import { createClient } from '@/src/auth/createClient';
import { Client } from '@/src/client/client';
import { RemoteFlowsErrorBoundary } from '@/src/components/error-handling/RemoteFlowsErrorBoundary';
import { lazyDefaultComponents } from './lazy-default-components';
import { FormLoadingFallback } from '@/src/components/form/FormLoadingFallback';
import { DelayedFallback } from '@/src/components/form/DelayedFallback';
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
  components: userComponents = {},
}: PropsWithChildren<{
  components?: Components;
}>) {
  // Merge user components with lazy defaults
  // User-provided components take precedence, lazy defaults are only used as fallback
  const resolvedComponents = useMemo(() => {
    // Spread lazy defaults first, then override with user components
    return {
      ...lazyDefaultComponents,
      ...userComponents,
    } as Components;
  }, [userComponents]);

  return (
    <FormFieldsContext.Provider value={{ components: resolvedComponents }}>
      <Suspense
        fallback={
          <DelayedFallback fallback={<FormLoadingFallback />} delay={200} />
        }
      >
        {children}
      </Suspense>
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
