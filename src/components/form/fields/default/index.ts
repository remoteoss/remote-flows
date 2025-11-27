import { Components } from '@/src/types/remoteFlows';
import { FileUploadFieldDefault } from './FileUploadFieldDefault';

/**
 * Default field components provided by RemoteFlows.
 * These components provide the standard UI implementations for all field types.
 * You can use these as-is or override specific fields with custom components.
 */
export const defaultComponents: Components = {
  file: FileUploadFieldDefault,
};
