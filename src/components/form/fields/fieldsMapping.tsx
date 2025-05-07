import { CheckBoxField } from '@/src/components/form/fields/CheckBoxField';
import { DatePickerField } from '@/src/components/form/fields/DatePickerField';
import { EmailField } from '@/src/components/form/fields/EmailField';
import { FieldSetField } from '@/src/components/form/fields/FieldSetField';
import { FileUploadField } from '@/src/components/form/fields/FileUploadField';
import { MoneyField } from '@/src/components/form/fields/MoneyField';
import { NumberField } from '@/src/components/form/fields/NumberField';
import { RadioGroupField } from '@/src/components/form/fields/RadioGroupField';
import { SelectField } from '@/src/components/form/fields/SelectField';
import { TextAreaField } from '@/src/components/form/fields/TextAreaField';
import { TextField } from '@/src/components/form/fields/TextField';
import { SupportedTypes } from '@/src/components/form/fields/types';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fieldsMap: Record<SupportedTypes, React.ComponentType<any>> = {
  checkbox: CheckBoxField,
  text: TextField,
  email: EmailField,
  money: MoneyField,
  select: SelectField,
  radio: RadioGroupField,
  number: NumberField,
  file: FileUploadField,
  fieldset: FieldSetField,
  date: DatePickerField,
  textarea: TextAreaField,
};
