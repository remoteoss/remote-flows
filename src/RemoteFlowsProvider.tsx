import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';

import { ThemeProvider } from '@/src/theme';
import { FormFieldsContext, RemoteFlowContext } from './context';
import { Components, RemoteFlowsSDKProps } from './types/remoteFlows';
import { createClient } from '@/src/auth/createClient';
import { Client } from '@/src/client/client';
import { RemoteFlowsErrorBoundary } from '@/src/components/error-handling/RemoteFlowsErrorBoundary';
import { lazyDefaultComponents } from './lazy-default-components';

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
  errorBoundary = { useParentErrorBoundary: true },
}: PropsWithChildren<RemoteFlowsSDKProps>) {
  const client = useMemo(
    () => createClient(auth, { environment, proxy }),
    [auth, environment, proxy],
  );
  return (
    <RemoteFlowsErrorBoundary errorBoundary={errorBoundary}>
      <QueryClientProvider client={queryClient}>
        <FormFieldsProvider components={components}>
          <RemoteFlowContextWrapper client={client}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
          </RemoteFlowContextWrapper>
        </FormFieldsProvider>
      </QueryClientProvider>
    </RemoteFlowsErrorBoundary>
  );
}
