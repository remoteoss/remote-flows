import { FormField } from '@/src/components/ui/form';
import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
} from 'react-hook-form';

export type CheckBoxFieldProps = {
  name: string;
} & Partial<
  JSFField & {
    onChange?: (checked: boolean, optionId?: string) => void;
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

  const handleCheckboxChange = (
    field: ControllerRenderProps<FieldValues, string>,
    checked: boolean,
    optionId?: string,
  ) => {
    if (multiple && optionId) {
      // Multiple checkboxes: manage as array
      const currentValues = field.value ? [...field.value] : [];
      if (checked) {
        if (!currentValues.includes(optionId)) {
          field.onChange([...currentValues, optionId]);
        }
      } else {
        field.onChange(currentValues.filter((value) => value !== optionId));
      }
    } else {
      // Single checkbox: simple boolean toggle
      field.onChange(checked);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        const Component = component || components?.checkbox;

        if (!Component) {
          throw new Error(`Checkbox component not found for field ${name}`);
        }

        const customCheckboxFieldProps = {
          name,
          description,
          label,
          defaultValue,
          multiple,
          options,
          ...rest,
        };
        return (
          <Component
            field={{
              ...field,
              onChange: (checked: boolean, optionId?: string) => {
                handleCheckboxChange(field, checked, optionId);
                onChange?.(checked, optionId);
              },
            }}
            fieldState={fieldState}
            fieldData={customCheckboxFieldProps}
          />
        );
      }}
    />
  );
}
