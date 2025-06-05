import { CheckBoxField } from '@/src/components/form/fields/CheckBoxField';
import { DatePickerField } from '@/src/components/form/fields/DatePickerField';
import { FieldSetField } from '@/src/components/form/fields/FieldSetField';
import { FileUploadField } from '@/src/components/form/fields/FileUploadField';
import { NumberField } from '@/src/components/form/fields/NumberField';
import { RadioGroupField } from '@/src/components/form/fields/RadioGroupField';
import { SelectField } from '@/src/components/form/fields/SelectField';
import { CountryField } from '@/src/components/form/fields/CountryField';
import { TextAreaField } from '@/src/components/form/fields/TextAreaField';
import { TextField } from '@/src/components/form/fields/TextField';
import { EmailField } from '@/src/components/form/fields/EmailField';
import { SupportedTypes } from '@/src/components/form/fields/types';
import { HiddenField } from '@/src/components/form/fields/HiddenField';
import { WorkScheduleField } from '@/src/components/form/fields/WorkScheduleField';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fieldsMap: Record<SupportedTypes, React.ComponentType<any>> = {
  checkbox: CheckBoxField,
  text: TextField,
  email: EmailField,
  money: NumberField,
  select: SelectField,
  radio: RadioGroupField,
  number: NumberField,
  file: FileUploadField,
  fieldset: FieldSetField,
  date: DatePickerField,
  textarea: TextAreaField,
  countries: CountryField,
  hidden: HiddenField,
  'work-schedule': WorkScheduleField,
};
