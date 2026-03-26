import { TextField } from '@/src/components/form/fields/TextField';
import { FieldComponentProps } from '@/src/types/fields';
import { useFormFields } from '@/src/context';

export function EmailFieldDefault({ field, fieldData }: FieldComponentProps) {
  const { makeComponentsRequired } = useFormFields();
  if (makeComponentsRequired) {
    console.log('Missing component: EmailFieldDefault');
    return null;
  }
  return <TextField name={field.name} {...fieldData} type='email' />;
}
