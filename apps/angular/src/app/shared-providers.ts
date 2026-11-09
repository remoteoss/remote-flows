import { provideRemoteFlows } from '@remoteoss/remote-flows-angular';
import { MATERIAL_FIELD_COMPONENTS } from './fields/material-fields';

export const sharedProviders = [
  provideRemoteFlows({
    fields: MATERIAL_FIELD_COMPONENTS,
    proxy: { url: window.location.origin },
  }),
];
