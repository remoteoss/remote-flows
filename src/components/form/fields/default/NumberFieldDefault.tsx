import { TextField } from '@/src/components/form/fields/TextField';
import { FieldComponentProps } from '@/src/types/fields';

export function NumberFieldDefault({ field, fieldData }: FieldComponentProps) {
  return (
    <TextField
      type='text'
      inputMode='decimal'
      pattern='^[0-9.]*$'
      {...field}
      {...fieldData}
    />
  );
}
