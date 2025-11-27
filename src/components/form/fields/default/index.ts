import { Components } from '@/src/types/remoteFlows';
import { FileUploadFieldDefault } from './FileUploadFieldDefault';
import { TextAreaFieldDefault } from '@/src/components/form/fields/default/TextAreaFieldDefault';

/**
 * Default field components provided by RemoteFlows.
 * These components provide the standard UI implementations for all field types.
 * You can use these as-is or override specific fields with custom components.
 */
export const defaultComponents: Components = {
  file: FileUploadFieldDefault,
  textarea: TextAreaFieldDefault,
  select: SelectFieldDefault,
};
