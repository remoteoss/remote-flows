import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import { FormField } from '../../ui/form';
import { isConstAndDefaultEquals } from '@/src/components/form/utils';
import { Field } from '@/src/flows/types';

export function HiddenField(props: Field) {
  const { control, setValue } = useFormContext();
  const hasForcedConst = isConstAndDefaultEquals(props);

  // If the field has a forced/computed value (const === default), set it
  // If not it'll get the value from the form state
  useEffect(() => {
    if (hasForcedConst && props.name) {
      setValue(props.name, props.const);
    }
  }, [hasForcedConst, props.const, props.name, setValue]);

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
