import { TextField } from '@/src/components/form/fields/TextField';
import { FieldComponentProps } from '@/src/types/fields';
import { useFormFields } from '@/src/context';

export function NumberFieldDefault({ field, fieldData }: FieldComponentProps) {
  const { makeComponentsRequired } = useFormFields();
  if (makeComponentsRequired) {
    console.log('Missing component: NumberFieldDefault');
    return null;
  }
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
