import { Provider } from '@angular/core';
import { DEFAULT_FIELD_COMPONENTS } from './default-fields';
import { FIELD_COMPONENTS, FieldComponents } from './field-contract';

export function provideRemoteFlows(config: {
  components?: FieldComponents;
}): Provider {
  return {
    provide: FIELD_COMPONENTS,
    useValue: { ...DEFAULT_FIELD_COMPONENTS, ...config.components },
  };
}
