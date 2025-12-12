import { useFormContext } from 'react-hook-form';
import { useFormFields } from '@/src/context';
import { FormField } from '@/src/components/ui/form';
import { Components } from '@/src/types/remoteFlows';
import { TextFieldProps } from './TextField';

export type NumberFieldProps = TextFieldProps & {
  component?: Components['number'];
  onChange?: (value: number) => void;
};

export function NumberField(props: NumberFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();

  const Component = props.component || components.number;
  if (!Component) {
    throw new Error(`Number component not found for field ${props.name}`);
  }
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
