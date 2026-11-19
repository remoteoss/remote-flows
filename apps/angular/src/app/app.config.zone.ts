import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { sharedProviders } from './providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    ...sharedProviders,
  ],
};
