import React from 'react';
import { FieldsetField } from '@/src/components/form/fields/Fieldset';
import { TextField } from '@/src/components/form/fields/TextField';
import { RadioGroupField } from '@/src/components/form/fields/RadioGroupField';
import { SelectField } from '@/src/components/form/fields/SelectField';
import { $TSFixMe } from '@remoteoss/json-schema-form';

export const fieldsMapConfig = {
  radio: RadioGroupField,
  number: (props: $TSFixMe) => <TextField type="number" {...props} />,
  fieldset: FieldsetField,
  select: SelectField,
};
