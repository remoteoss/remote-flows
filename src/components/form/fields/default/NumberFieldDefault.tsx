import { TextField } from '@/src/components/form/fields/TextField';
import { FieldComponentProps } from '@/src/types/fields';

export function NumberFieldDefault({ field, fieldData }: FieldComponentProps) {
  const { ref: _ref, ...fieldProps } = field;

  return (
    <TextField
      type='text'
      inputMode='decimal'
      pattern='^[0-9.]*$'
      {...fieldProps}
      {...fieldData}
    />
  );
}
