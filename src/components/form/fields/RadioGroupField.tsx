/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from 'react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group';
import { useFormFields } from '@/src/context';
import { cn } from '@/src/lib/utils';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';

type RadioGroupFieldProps = JSFField & {
  onChange?: (value: any) => void;
  component?: Components['radio'];
};

export function RadioGroupField({
  name,
  defaultValue,
  description,
  label,
  options,
  onChange,
  component,
  ...rest
}: RadioGroupFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        const CustomRadioGroupField = component || components?.radio;
        if (CustomRadioGroupField) {
          const customRadioGroupFieldProps = {
            name,
            defaultValue,
            description,
            label,
            options,
            ...rest,
          };
          return (
            <CustomRadioGroupField
              field={{
                ...field,
                onChange: (value: any) => {
                  field.onChange(value);
                  onChange?.(value);
                },
              }}
              fieldState={fieldState}
              fieldData={customRadioGroupFieldProps}
            />
          );
        }

        return (
          <FormItem
            className={cn(
              'space-y-3',
              `RemoteFlows__RadioGroupField__Item__${name}`,
            )}
            data-field={name}
          >
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <RadioGroup
                aria-label={label || name}
                onValueChange={(value: string) => {
                  field.onChange(value);
                  onChange?.(value);
                }}
                value={field.value}
                className="flex flex-col space-y-3"
              >
                {options?.map((option) => (
                  <Fragment key={option.value}>
                    <FormItem
                      data-field={name}
                      className="flex items-start space-x-3 space-y-0 gap-0 RemoteFlows__RadioField__Item"
                    >
                      <FormControl>
                        <RadioGroupItem
                          value={option.value}
                          className="RemoteFlows__RadioField__Input"
                          disabled={option.disabled}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="font-normal mb-0 RemoteFlows__RadioField__Label">
                          {option.label}
                        </FormLabel>
                        {option.description && (
                          <FormDescription className="mt-2">
                            {option.description}
                          </FormDescription>
                        )}
                      </div>
                    </FormItem>
                  </Fragment>
                ))}
              </RadioGroup>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {fieldState.error && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}
