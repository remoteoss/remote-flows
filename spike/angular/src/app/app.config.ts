import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { MATERIAL_FIELD_COMPONENTS } from './material-fields';
import { provideRemoteFlows } from './provide-remote-flows';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRemoteFlows({
      components: MATERIAL_FIELD_COMPONENTS,
      proxy: { url: window.location.origin },
    }),
  ],
};
