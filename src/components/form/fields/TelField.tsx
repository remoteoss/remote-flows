import { FormField } from '@/src/components/ui/form';
import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';

export type TelFieldDataProps = Omit<JSFField, 'options'> & {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  component?: Components['tel'];
  options: {
    value: string;
    label: string;
    meta: {
      countryCode: string;
    };
    pattern: string;
  }[];
};

export function TelField({
  name,
  description,
  label,
  onChange,
  component,
  ...rest
}: TelFieldDataProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const Component = component || components.tel;
        if (!Component) {
          throw new Error(`Tel component not found for field ${name}`);
        }
        const customTelFieldProps: TelFieldDataProps = {
          name,
          description,
          label,
          ...rest,
        };

        return (
          <Component
            field={{
              ...field,
              onChange: (evt: React.ChangeEvent<HTMLInputElement>) => {
                field.onChange(evt);
                onChange?.(evt);
              },
            }}
            fieldState={fieldState}
            fieldData={customTelFieldProps}
          />
        );
      }}
    />
  );
}
