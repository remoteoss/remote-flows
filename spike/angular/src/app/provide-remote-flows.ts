import { makeEnvironmentProviders } from '@angular/core';
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { createClient } from '@/src/auth/createClient';
import { REMOTE_CLIENT } from './api';
import { FIELD_COMPONENTS, FieldComponents } from './field-contract';

export function provideRemoteFlows(config: {
  components: FieldComponents;
  proxy: { url: string; headers?: Record<string, string> };
  queryClient?: QueryClient;
}) {
  return makeEnvironmentProviders([
    provideTanStackQuery(config.queryClient ?? new QueryClient()),
    {
      provide: REMOTE_CLIENT,
      useFactory: () => createClient(undefined, { proxy: config.proxy }),
    },
    { provide: FIELD_COMPONENTS, useValue: config.components },
  ]);
}
