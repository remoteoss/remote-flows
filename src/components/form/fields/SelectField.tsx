import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { FormField } from '@/src/components/ui/form';

type SelectFieldProps = JSFField & {
  placeholder?: string;
  options: Array<{ value: string | number; label: string }>;
  className?: string;
  onChange?: (value: string | number) => void;
  component?: Components['select'];
};

export function SelectField({
  label,
  name,
  options,
  defaultValue,
  description,
  onChange,
  component,
  ...rest
}: SelectFieldProps) {
  const { control } = useFormContext();
  const { components } = useFormFields();

  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const Component = component || components?.select;

        if (!Component) {
          throw new Error(`Select component not found for field ${name}`);
        }

        const customSelectFieldProps = {
          label,
          name,
          options,
          defaultValue,
          description,
          onChange,
          ...rest,
        };
        return (
          <Component
            field={{
              ...field,
              onChange: (value: string | number) => {
                const maybeCastValue =
                  rest.jsonType === 'number' ? Number(value) : value;
                field.onChange(maybeCastValue);
                onChange?.(maybeCastValue);
              },
            }}
            fieldState={fieldState}
            fieldData={customSelectFieldProps}
          />
        );
      }}
    />
  );
}
