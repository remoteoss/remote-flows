import { CheckBoxField } from '@/src/components/form/fields/CheckBoxField';
import { DatePickerField } from '@/src/components/form/fields/DatePickerField';
import { EmailField } from '@/src/components/form/fields/EmailField';
import { FieldSetField } from '@/src/components/form/fields/FieldSetField';
import { FileUploadField } from '@/src/components/form/fields/FileUploadField';
import { MoneyField } from '@/src/components/form/fields/MoneyField';
import { NumberField } from '@/src/components/form/fields/NumberField';
import { RadioGroupField } from '@/src/components/form/fields/RadioGroupField';
import { SelectField } from '@/src/components/form/fields/SelectField';
import { CountryField } from '@/src/components/form/fields/CountryField';
import { TextAreaField } from '@/src/components/form/fields/TextAreaField';
import { TextField } from '@/src/components/form/fields/TextField';
import { SupportedTypes } from '@/src/components/form/fields/types';
import { HiddenField } from '@/src/components/form/fields/HiddenField';
import { WorkScheduleField } from '@/src/components/form/fields/WorkScheduleField';
import React from 'react';
import { MultiSelectField } from './MultiSelectField';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fieldsMap: Record<SupportedTypes, React.ComponentType<any>> = {
  checkbox: CheckBoxField,
  text: TextField,
  email: EmailField,
  money: MoneyField,
  select: SelectField,
  'multi-select': MultiSelectField,
  radio: RadioGroupField,
  number: NumberField,
  file: FileUploadField,
  fieldset: FieldSetField,
  'fieldset-flat': FieldSetField,
  date: DatePickerField,
  textarea: TextAreaField,
  countries: CountryField,
  hidden: HiddenField,
  'work-schedule': WorkScheduleField,
};
