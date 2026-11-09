import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { sharedProviders } from './shared-providers';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), ...sharedProviders],
};
