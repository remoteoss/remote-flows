import { JSFField } from '@/src/types/remoteFlows';

export type FieldDataProps = Partial<JSFField> & {
  metadata?: Record<string, unknown>;
};
