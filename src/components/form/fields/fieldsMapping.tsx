import React from 'react';
import { DatePickerField } from '@/src/components/form/fields/DatePickerField';
import { FieldSetField } from '@/src/components/form/fields/FieldSetField';
import { RadioGroupField } from '@/src/components/form/fields/RadioGroupField';
import { SelectField } from '@/src/components/form/fields/SelectField';
import { TextField } from '@/src/components/form/fields/TextField';
import { CheckBoxField } from '@/src/components/form/fields/CheckBoxField';
import { TextAreaField } from '@/src/components/form/fields/TextAreaField';
import { SupportedTypes } from '@/src/components/form/fields/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fieldsMap: Record<SupportedTypes, React.ComponentType<any>> = {
  checkbox: CheckBoxField,
  text: TextField,
  select: SelectField,
  radio: RadioGroupField,
  number: (props) => <TextField {...props} type="text" />,
  fieldset: FieldSetField,
  date: DatePickerField,
  textarea: TextAreaField,
};
