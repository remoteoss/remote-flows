import { useFormFields } from '@/src/context';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { TextFieldProps } from './TextField';
import { Components } from '@/src/types/remoteFlows';

type EmailFieldProps = TextFieldProps & {
  component?: Components['email'];
};

export function EmailField(props: EmailFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();

  const CustomEmailField = props.component || components.email;
  return (
    <FormField
      control={control}
      name={props.name}
      render={({ field, fieldState }) => {
        return (
          <CustomEmailField
            field={{
              ...field,
              onChange: (value: string) => {
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
