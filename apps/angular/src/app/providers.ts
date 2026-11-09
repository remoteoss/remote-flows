import { InjectionToken, Provider } from '@angular/core';
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { createClient } from '@remoteoss/remote-flows-core';
import { MATERIAL_FIELD_COMPONENTS } from './fields/material-fields';
import { FIELD_COMPONENTS } from './remote-flows/field-contract';

export const REMOTE_CLIENT = new InjectionToken<
  ReturnType<typeof createClient>
>('REMOTE_CLIENT', {
  providedIn: 'root',
  factory: () =>
    createClient(undefined, {
      proxy: { url: window.location.origin },
      version: '0.0.0',
    }),
});

export const sharedProviders: Provider[] = [
  provideTanStackQuery(new QueryClient()),
  { provide: FIELD_COMPONENTS, useValue: MATERIAL_FIELD_COMPONENTS },
];
