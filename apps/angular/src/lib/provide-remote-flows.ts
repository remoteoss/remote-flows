import { InjectionToken, makeEnvironmentProviders } from '@angular/core';
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { createClient } from '@remoteoss/remote-flows-core';
import { FIELD_COMPONENTS, FieldComponents } from './forms/field-contract';

export const REMOTE_CLIENT = new InjectionToken<
  ReturnType<typeof createClient>
>('REMOTE_CLIENT');

export function provideRemoteFlows(config: {
  fields: FieldComponents;
  proxy: { url: string; headers?: Record<string, string> };
  queryClient?: QueryClient;
}) {
  return makeEnvironmentProviders([
    provideTanStackQuery(config.queryClient ?? new QueryClient()),
    {
      provide: REMOTE_CLIENT,
      useFactory: () =>
        createClient(undefined, { proxy: config.proxy, version: '0.0.0' }),
    },
    { provide: FIELD_COMPONENTS, useValue: config.fields },
  ]);
}
