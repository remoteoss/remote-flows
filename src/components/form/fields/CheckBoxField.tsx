/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormField } from '@/src/components/ui/form';
import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { CheckBoxFieldDefault } from './default/CheckBoxFieldDefault';

export type CheckBoxFieldProps = {
  name: string;
} & Partial<
  JSFField & {
    onChange?: (checked: any, optionId?: string) => void;
    component?: Components['checkbox'];
  }
>;

export function CheckBoxField({
  name,
  defaultValue,
  description,
  label,
  onChange,
  multiple,
  options,
  component,
  ...rest
}: CheckBoxFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        const CustomCheckboxField = component || components?.checkbox;
        const Component = CustomCheckboxField || CheckBoxFieldDefault;

        const handleCheckboxChange = (checked: boolean, optionId?: string) => {
          const currentValues = field.value ? [...field.value] : [];

          if (checked) {
            if (optionId && !currentValues.includes(optionId)) {
              field.onChange([...currentValues, optionId]);
            }
          } else {
            field.onChange(currentValues.filter((value) => value !== optionId));
          }

          // Call the onChange callback with (checked, optionId) for multiple checkboxes
          onChange?.(checked, optionId);
        };

        const fieldData = {
          name,
          description,
          label,
          defaultValue,
          multiple,
          options,
          onChange: handleCheckboxChange,
          ...rest,
        };

        return (
          <Component
            field={field}
            fieldState={fieldState}
            fieldData={fieldData}
          />
        );
      }}
    />
  );
}
