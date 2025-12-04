import { TextField } from '@/src/components/form/fields/TextField';
import { FieldComponentProps } from '@/src/types/fields';

export function EmailFieldDefault({ field, fieldData }: FieldComponentProps) {
  return <TextField name={field.name} {...fieldData} type='email' />;
}
