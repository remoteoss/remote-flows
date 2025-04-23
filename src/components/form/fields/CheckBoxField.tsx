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
import { JSFField } from '@/src/types/remoteFlows';
import { CheckedState } from '@radix-ui/react-checkbox';
import * as React from 'react';
import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
} from 'react-hook-form';

export type CheckBoxFieldProps = JSFField & {
  onChange?: (value: any) => void;
};

export function CheckBoxField({
  name,
  defaultValue,
  description,
  label,
  onChange,
  multiple,
  options,
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
        if (components?.checkbox) {
          const CustomCheckboxField = components?.checkbox;
          const customCheckboxFieldProps = {
            name,
            description,
            label,
            defaultValue,
            ...rest,
          };
          return (
            <CustomCheckboxField
              field={{
                ...field,
                onChange: (value: any) => {
                  field.onChange(value);
                  onChange?.(value);
                },
              }}
              fieldState={fieldState}
              fieldData={customCheckboxFieldProps}
            />
          );
        }
        return (
          <FormItem className={cn(`RemoteFlows__CheckBoxField__Item__${name}`)}>
            <FormControl>
              <>
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
