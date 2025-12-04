import { useFormFields } from '@/src/context';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import { TextFieldProps } from './TextField';
import { Components } from '@/src/types/remoteFlows';
import { EmailFieldDefault } from '@/src/components/form/fields/default/EmailFieldDefault';

type EmailFieldProps = TextFieldProps & {
  component?: Components['email'];
};

export function EmailField(props: EmailFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();

  const CustomEmailField = props.component || components?.email;
  const Component = CustomEmailField || EmailFieldDefault;
  return (
    <FormField
      control={control}
      name={props.name}
      render={({ field, fieldState }) => {
        return (
          <Component
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
