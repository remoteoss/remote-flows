import { JSFField } from '@/src/types/remoteFlows';

/**
 * Base type for field metadata passed to custom field components.
 * Extends JSFField with optional metadata for extensibility.
 */
export type FieldDataProps = Partial<JSFField> & {
  metadata?: Record<string, unknown>;
};
