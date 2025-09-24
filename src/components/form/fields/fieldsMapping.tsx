import { $TSFixMe } from '@/src/types/remoteFlows';
import { baseFields } from './baseFields';
import { FieldSetField } from './FieldSetField';
import { SupportedTypes } from './types';

export const fieldsMap: Record<
  SupportedTypes,
  React.ComponentType<$TSFixMe>
> = {
  ...baseFields,
  fieldset: FieldSetField,
  'fieldset-flat': FieldSetField,
};
