import { Components } from '@/src/types/remoteFlows';
import { FileUploadFieldDefault } from './FileUploadFieldDefault';
import { TextAreaFieldDefault } from '@/src/components/form/fields/default/TextAreaFieldDefault';
import { SelectFieldDefault } from '@/src/components/form/fields/default/SelectFieldDefault';
import { CountryFieldDefault } from '@/src/components/form/fields/default/CountryFieldDefault';
import { StatementDefault } from '@/src/components/form/fields/default/StatementDefault';

/**
 * Default field components provided by RemoteFlows.
 * These components provide the standard UI implementations for all field types.
 * You can use these as-is or override specific fields with custom components.
 */
export const defaultComponents: Components = {
  countries: CountryFieldDefault,
  file: FileUploadFieldDefault,
  textarea: TextAreaFieldDefault,
  select: SelectFieldDefault,
  statement: StatementDefault,
};
