import React from 'react';
import { FieldSetField } from '@/src/components/form/fields/FieldSetField';
import { TextField } from '@/src/components/form/fields/TextField';
import { RadioGroupField } from '@/src/components/form/fields/RadioGroupField';
import { SelectField } from '@/src/components/form/fields/SelectField';
import { $TSFixMe } from '@remoteoss/json-schema-form';

export const fieldsMapConfig: Record<string, React.ComponentType<any>> = {
  radio: RadioGroupField,
  number: (props: $TSFixMe) => <TextField type="number" {...props} />,
  fieldset: FieldSetField,
  select: SelectField,
};
