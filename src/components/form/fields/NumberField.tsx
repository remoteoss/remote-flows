import { useFormContext } from 'react-hook-form';
import { useFormFields } from '@/src/context';
import { FormField } from '@/src/components/ui/form';
import { Components } from '@/src/types/remoteFlows';
import { NumberFieldDefault } from '@/src/components/form/fields/default/NumberFieldDefault';
import { TextFieldProps } from './TextField';

export type NumberFieldProps = TextFieldProps & {
  component?: Components['number'];
  onChange?: (value: number) => void;
};

export function NumberField(props: NumberFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();

  const CustomNumberField = props.component || components?.number;
  const Component = CustomNumberField || NumberFieldDefault;
  return (
    <FormField
      control={control}
      name={props.name}
      render={({ field, fieldState }) => {
        return (
          <Component
            field={{
              ...field,
              onChange: (value: number) => {
                field.onChange(value);
                props.onChange?.(value);
              },
            }}
            fieldState={fieldState}
            fieldData={props}
          />
        );
      }}
    />
  );
}
