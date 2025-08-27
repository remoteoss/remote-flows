import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { Field } from '@/src/flows/types';

export function HiddenField(props: Field) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={props.name}
      render={({ field }) => {
        return <input {...field} type='hidden' />;
      }}
    />
  );
}
