import { InjectionToken, makeEnvironmentProviders } from '@angular/core';
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import type { Environment } from '@remoteoss/remote-flows-core';
import type { Client } from '@remoteoss/remote-flows-core/client/client';
import { createClient } from './create-client';
import { FIELD_COMPONENTS, FieldComponents } from './forms/field-contract';

export const REMOTE_CLIENT = new InjectionToken<Client>('REMOTE_CLIENT');

export function provideRemoteFlows(config: {
  fields: FieldComponents;
  proxy: { url: string; headers?: Record<string, string> };
  environment?: Environment;
}) {
  return makeEnvironmentProviders([
    provideTanStackQuery(new QueryClient()),
    {
      provide: REMOTE_CLIENT,
      useFactory: () =>
        createClient({
          proxy: config.proxy,
          environment: config.environment,
        }),
    },
    { provide: FIELD_COMPONENTS, useValue: config.fields },
  ]);
}
