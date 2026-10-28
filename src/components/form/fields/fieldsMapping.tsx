import { $TSFixMe } from '@/src/types/remoteFlows';
import { baseFields } from './baseFields';
import { FieldSetField } from './FieldSetField';
import { GroupArrayField } from './GroupArrayField';
import { SupportedTypes } from './types';

export const fieldsMap: Record<
  SupportedTypes,
  React.ComponentType<$TSFixMe>
> = {
  ...baseFields,
  fieldset: FieldSetField,
  'fieldset-flat': FieldSetField,
  'group-array': GroupArrayField,
};
