import { useFormFields } from '@/src/context';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { TextFieldProps } from './TextField';
import { Components } from '@/src/types/remoteFlows';
import { NumberFieldDefault } from '@/src/components/form/fields/default/NumberFieldDefault';

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
