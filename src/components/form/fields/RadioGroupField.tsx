import { FormField } from '@/src/components/ui/form';
import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';

type RadioGroupFieldProps = JSFField & {
  onChange?: (value: string) => void;
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
        const Component = component || components?.radio;
        if (!Component) {
          throw new Error(`Radio group component not found for field ${name}`);
        }
        const customRadioGroupFieldProps = {
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
              onChange: (value: string) => {
                field.onChange(value);
                onChange?.(value);
              },
            }}
            fieldState={fieldState}
            fieldData={customRadioGroupFieldProps}
          />
        );
      }}
    />
  );
}
