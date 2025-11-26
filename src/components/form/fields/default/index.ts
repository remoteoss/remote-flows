import { Components } from '@/src/types/remoteFlows';
import { CheckBoxFieldDefault } from './CheckBoxFieldDefault';
import { CountryFieldDefault } from './CountryFieldDefault';
import { DatePickerFieldDefault } from './DatePickerFieldDefault';
import { EmailFieldDefault } from './EmailFieldDefault';
import { FileUploadFieldDefault } from './FileUploadFieldDefault';
import { MultiSelectFieldDefault } from './MultiSelectFieldDefault';
import { NumberFieldDefault } from './NumberFieldDefault';
import { RadioGroupFieldDefault } from './RadioGroupFieldDefault';
import { SelectFieldDefault } from './SelectFieldDefault';
import { TextAreaFieldDefault } from './TextAreaFieldDefault';
import { TextFieldDefault } from './TextFieldDefault';
import { WorkScheduleFieldDefault } from './WorkScheduleFieldDefault';

/**
 * Default field components provided by RemoteFlows.
 * These components provide the standard UI implementations for all field types.
 * You can use these as-is or override specific fields with custom components.
 */
export const defaultComponents: Components = {
  checkbox: CheckBoxFieldDefault,
  countries: CountryFieldDefault,
  date: DatePickerFieldDefault,
  email: EmailFieldDefault,
  file: FileUploadFieldDefault,
  'multi-select': MultiSelectFieldDefault,
  number: NumberFieldDefault,
  radio: RadioGroupFieldDefault,
  select: SelectFieldDefault,
  textarea: TextAreaFieldDefault,
  text: TextFieldDefault,
  'work-schedule': WorkScheduleFieldDefault,
};
