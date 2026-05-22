import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import { FormField } from '../../ui/form';
import { Field } from '@/src/flows/types';

export function HiddenField(props: Field) {
  const { control, setValue } = useFormContext();

  // If the field has a forced/computed value (const === default), set it
  // If not it'll get the value from the form state
  useEffect(() => {
    if (
      props.const !== undefined &&
      props.const === props.default &&
      props.name
    ) {
      setValue(props.name, props.const);
    }
  }, [props.const, props.default, props.name, setValue]);

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
