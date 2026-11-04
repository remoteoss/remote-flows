import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useFormFields, useTransformer } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { FormField } from '@/src/components/ui/form';
import { isForceValue } from '@/src/components/form/utils';

type SelectFieldProps = JSFField & {
  placeholder?: string;
  options: Array<{ value: string | number; label: string }>;
  className?: string;
  onChange?: (value: string | number) => void;
  component?: Components['select'];
  readOnly?: boolean;
  const?: unknown;
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
  const { control, getValues, setValue } = useFormContext();
  const { components } = useFormFields();
  const transformHtml = useTransformer();
  const readOnlyValue =
    rest.readOnly === true && isForceValue(rest) ? rest.const : undefined;

  useEffect(() => {
    if (readOnlyValue !== undefined && getValues(name) !== readOnlyValue) {
      setValue(name, readOnlyValue);
    }
  }, [name, readOnlyValue, getValues, setValue]);

  return (
    <FormField
      defaultValue={readOnlyValue ?? defaultValue}
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
          transformHtml,
          ...rest,
        };
        return (
          <Component
            field={{
              ...field,
              value: readOnlyValue ?? field.value,
              onChange: (value: string | number) => {
                const isNumberType = Array.isArray(rest.jsonType)
                  ? rest.jsonType.includes('number')
                  : rest.jsonType === 'number';
                const maybeCastValue =
                  isNumberType && value !== '' ? Number(value) : value;
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
