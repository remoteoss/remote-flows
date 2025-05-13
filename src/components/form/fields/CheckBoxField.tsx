/* eslint-disable @typescript-eslint/no-explicit-any */
import { Checkbox } from '@/src/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { useFormFields } from '@/src/context';
import { cn } from '@/src/lib/utils';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { CheckedState } from '@radix-ui/react-checkbox';
import * as React from 'react';
import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
} from 'react-hook-form';

export type CheckBoxFieldProps = JSFField & {
  onChange?: (checked: any, optionId?: string) => void;
  component?: Components['checkbox'];
};

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
    optionId: string,
    checked: boolean,
    field: ControllerRenderProps<FieldValues, string>,
  ) => {
    const currentValues = field.value ? [...field.value] : [];

    if (checked) {
      // Add the value if it's not already in the array
      if (!currentValues.includes(optionId)) {
        field.onChange([...currentValues, optionId]);
      }
    } else {
      // Remove the value from the array
      field.onChange(currentValues.filter((value) => value !== optionId));
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        const CustomCheckboxField = component || components?.checkbox;
        if (CustomCheckboxField) {
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
            <CustomCheckboxField
              field={{
                ...field,
                onChange: (evt: any) => {
                  if (multiple) {
                    const { checked, value } = evt.target;
                    handleCheckboxChange(value, checked, field);
                    onChange?.(checked);
                    return;
                  }
                  field.onChange(evt);
                  onChange?.(evt);
                },
              }}
              fieldState={fieldState}
              fieldData={customCheckboxFieldProps}
            />
          );
        }
        return (
          <FormItem
            data-field={name}
            className={cn(`RemoteFlows__CheckBoxField__Item__${name}`)}
          >
            <FormControl>
              <>
                {options && multiple ? <FormLabel>{label}</FormLabel> : null}

                {options && multiple ? (
                  options.map((option) => (
                    <div key={option.value} className="flex space-x-2">
                      <Checkbox
                        id={option.value}
                        onCheckedChange={(checked: CheckedState) => {
                          handleCheckboxChange(
                            option.value,
                            checked === true,
                            field,
                          );
                          onChange?.(checked, option.value);
                        }}
                        checked={field.value?.includes(option.value)}
                        className="RemoteFlows__CheckBox__Input"
                      />
                      <FormLabel
                        htmlFor={option.value}
                        className="mb-0 RemoteFlows__CheckBox__Label"
                      >
                        {option.label}
                      </FormLabel>
                    </div>
                  ))
                ) : (
                  <div className="flex space-x-2">
                    <Checkbox
                      id={name}
                      onCheckedChange={(event: CheckedState) => {
                        field.onChange(event);
                        onChange?.(event);
                      }}
                      checked={field.value}
                      className="RemoteFlows__CheckBox__Input"
                    />
                    <FormLabel
                      htmlFor={name}
                      className="mb-0 RemoteFlows__CheckBox__Label"
                    >
                      {label}
                    </FormLabel>
                  </div>
                )}
              </>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {fieldState.error && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}
