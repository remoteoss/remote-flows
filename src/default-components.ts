import { Components } from '@/src/types/remoteFlows';
import { FileUploadFieldDefault } from '@/src/components/form/fields/default/FileUploadFieldDefault';
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
import { FieldsetToggleButtonDefault } from '@/src/components/form/fields/default/FieldsetToggleButtonDefault';
import { DrawerDefault } from '@/src/components/shared/drawer/DrawerDefault';
import { ZendeskDrawerDefault } from '@/src/components/shared/zendesk-drawer/ZendeskDrawerDefault';
import { TableFieldDefault } from '@/src/components/shared/table/TableFieldDefault';
import { CheckboxFieldDefault } from '@/src/components/form/fields/default/CheckboxFieldDefault';
import { WorkScheduleFieldDefault } from '@/src/components/form/fields/default/WorkScheduleFieldDefault';
/**
 * Default field components for RemoteFlows.
 *
 * This module exports all default field component implementations and a pre-configured
 * `defaultComponents` object that can be passed to the RemoteFlows SDK.
 *
 * @example
 * ```tsx
 * import { defaultComponents } from '@remoteoss/remote-flows/default-components';
 *
 * <RemoteFlows components={defaultComponents} {...otherProps}>
 *   {children}
 * </RemoteFlows>
 * ```
 *
 *
 */
export const defaultComponents: Components = {
  checkbox: CheckboxFieldDefault,
  countries: CountryFieldDefault,
  date: DatePickerFieldDefault,
  drawer: DrawerDefault,
  email: EmailFieldDefault,
  fieldsetToggle: FieldsetToggleButtonDefault,
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
  'work-schedule': WorkScheduleFieldDefault,
};
