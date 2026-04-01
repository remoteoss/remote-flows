import { FormField } from '@/src/components/ui/form';
import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import {
  useFormContext,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
} from 'react-hook-form';
import { useEffect } from 'react';
import { TelFieldComponentProps } from '@/src/types/fields';

// Internal component to handle error transformation
function TelFieldRenderer({
  field,
  fieldState,
  fieldData,
  component: Component,
  onChange,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  fieldState: ControllerFieldState;
  fieldData: TelFieldDataProps;
  component: React.ComponentType<TelFieldComponentProps>;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { setError } = useFormContext();

  useEffect(() => {
    if (fieldState.error?.message?.includes('is not valid')) {
      const customMessage =
        'Please enter a valid phone number with country code (e.g. +15389274785)';

      setError(field.name, {
        type: fieldState.error.type,
        message: customMessage,
      });
    }
  }, [
    field.name,
    fieldState.error,
    fieldState.error?.message,
    fieldState?.error?.type,
    setError,
  ]);

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
      fieldData={fieldData}
    />
  );
}

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
          <TelFieldRenderer
            field={field}
            fieldState={fieldState}
            fieldData={customTelFieldProps}
            component={Component}
            onChange={onChange}
          />
        );
      }}
    />
  );
}
