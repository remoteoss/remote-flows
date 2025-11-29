import { Components } from '@/src/types/remoteFlows';
import { FileUploadFieldDefault } from './FileUploadFieldDefault';
import { TextAreaFieldDefault } from '@/src/components/form/fields/default/TextAreaFieldDefault';
import { SelectFieldDefault } from '@/src/components/form/fields/default/SelectFieldDefault';
import { CountryFieldDefault } from '@/src/components/form/fields/default/CountryFieldDefault';
import { StatementDefault } from '@/src/components/form/fields/default/StatementDefault';
import { DatePickerFieldDefault } from '@/src/components/form/fields/default/DatePickerFieldDefault';
import { NumberFieldDefault } from '@/src/components/form/fields/default/NumberFieldDefault';
import { EmailFieldDefault } from '@/src/components/form/fields/default/EmailFieldDefault';
import { RadioGroupFieldDefault } from '@/src/components/form/fields/default/RadioGroupFieldDefault';
import { MultiSelectFieldDefault } from '@/src/components/form/fields/default/MultiSelectFieldDefault';
import { TextFieldDefault } from '@/src/components/form/fields/default/TextFieldDefault';
import { ZendeskDrawerDefault } from '@/src/components/form/fields/default/ZendeskDrawerDefault';
import { DrawerDefault } from '@/src/components/form/fields/default/DrawerDefault';
import { TableFieldDefault } from '@/src/components/form/fields/default/TableFieldDefault';

/**
 * Default field components provided by RemoteFlows.
 * These components provide the standard UI implementations for all field types.
 * You can use these as-is or override specific fields with custom components.
 */
export const defaultComponents: Components = {
  countries: CountryFieldDefault,
  date: DatePickerFieldDefault,
  drawer: DrawerDefault,
  email: EmailFieldDefault,
  file: FileUploadFieldDefault,
  'multi-select': MultiSelectFieldDefault,
  number: NumberFieldDefault,
  radio: RadioGroupFieldDefault,
  select: SelectFieldDefault,
  statement: StatementDefault,
  textarea: TextAreaFieldDefault,
  text: TextFieldDefault,
  zendeskDrawer: ZendeskDrawerDefault,
  table: TableFieldDefault,
};
