import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { PartnerChipSelect } from './partner-chip-select';
import { provideRemoteFlows } from './provide-remote-flows';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRemoteFlows({ components: { select: PartnerChipSelect } }),
  ],
};
