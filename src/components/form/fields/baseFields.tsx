import { CheckBoxField } from './CheckBoxField';
import { DatePickerField } from './DatePickerField';
import { FileUploadField } from './FileUploadField';
import { NumberField } from './NumberField';
import { RadioGroupField } from './RadioGroupField';
import { SelectField } from './SelectField';
import { CountryField } from './CountryField';
import { TextAreaField } from './TextAreaField';
import { TextField } from './TextField';
import { EmailField } from './EmailField';
import { HiddenField } from './HiddenField';
import { WorkScheduleField } from './WorkScheduleField';
import { MultiSelectField } from './MultiSelectField';
import { MoneyField } from './MoneyField';
import { SupportedTypes } from './types';

export const baseFields: Record<
  Exclude<SupportedTypes, 'fieldset' | 'fieldset-flat'>,
  React.ComponentType<any>
> = {
  checkbox: CheckBoxField,
  text: TextField,
  email: EmailField,
  money: MoneyField,
  select: SelectField,
  'multi-select': MultiSelectField,
  radio: RadioGroupField,
  number: NumberField,
  file: FileUploadField,
  date: DatePickerField,
  textarea: TextAreaField,
  countries: CountryField,
  hidden: HiddenField,
  'work-schedule': WorkScheduleField,
};
