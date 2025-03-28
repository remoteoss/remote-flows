import { DatePickerField } from '@/src/components/form/fields/DatePickerField';
import { FieldSetField } from '@/src/components/form/fields/FieldSetField';
import { RadioGroupField } from '@/src/components/form/fields/RadioGroupField';
import { SelectField } from '@/src/components/form/fields/SelectField';
import { TextField } from '@/src/components/form/fields/TextField';
import { SupportedTypes } from '@/src/components/form/fields/types';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fieldsMap: Record<SupportedTypes, React.ComponentType<any>> = {
  text: TextField,
  select: SelectField,
  radio: RadioGroupField,
  number: (props) => <TextField {...props} type="text" />,
  fieldset: FieldSetField,
  date: DatePickerField,
};
