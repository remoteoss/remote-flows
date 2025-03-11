import React from 'react';
import { FieldSetField } from '@/src/components/form/fields/FieldSetField';
import { TextField } from '@/src/components/form/fields/TextField';
import { RadioGroupField } from '@/src/components/form/fields/RadioGroupField';
import { SelectField } from '@/src/components/form/fields/SelectField';
import { SupportedTypes } from '@/src/components/form/fields/types';

export const fieldsMap: Record<SupportedTypes, React.ComponentType<any>> = {
  text: TextField,
  select: SelectField,
  radio: RadioGroupField,
  number: (props) => <TextField {...props} type="text" />,
  fieldset: FieldSetField,
};
