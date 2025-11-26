/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormField } from '@/src/components/ui/form';
import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { RadioGroupFieldDefault } from './default/RadioGroupFieldDefault';

type RadioGroupFieldProps = JSFField & {
  onChange?: (value: any) => void;
  component?: Components['radio'];
};

export function RadioGroupField({
  name,
  defaultValue,
  description,
  label,
  options,
  onChange,
  component,
  ...rest
}: RadioGroupFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        const CustomRadioGroupField = component || components?.radio;
        const Component = CustomRadioGroupField || RadioGroupFieldDefault;

        const fieldData = {
          name,
          defaultValue,
          description,
          label,
          options,
          ...rest,
        };

        return (
          <Component
            field={{
              ...field,
              onChange: (value: any) => {
                field.onChange(value);
                onChange?.(value);
              },
            }}
            fieldState={fieldState}
            fieldData={fieldData}
          />
        );
      }}
    />
  );
}
