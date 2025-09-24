import { baseFields } from './baseFields';
import { FieldSetField } from './FieldSetField';
import { SupportedTypes } from './types';

export const fieldsMap: Record<SupportedTypes, React.ComponentType<any>> = {
  ...baseFields,
  fieldset: FieldSetField,
  'fieldset-flat': FieldSetField,
};
