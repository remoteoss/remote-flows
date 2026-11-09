import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { sharedProviders } from './providers';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), ...sharedProviders],
};
