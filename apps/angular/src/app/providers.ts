import { InjectionToken, Provider } from '@angular/core';
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { createClient } from '@remoteoss/remote-flows-core';

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
];
