import { Fragment } from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group';
import { cn } from '@/src/lib/utils';
import { FieldComponentProps } from '@/src/types/fields';

export const RadioGroupFieldDefault = ({
  field,
  fieldData,
  fieldState,
}: FieldComponentProps) => {
  const { name, label, description, options } = fieldData;
  return (
    <fieldset
      className={cn('space-y-3', `RemoteFlows__RadioGroupField__Item__${name}`)}
      data-field={name}
    >
      <FormItem>
        <legend>{label}</legend>
        {description && <FormDescription>{description}</FormDescription>}
        <FormControl>
          <RadioGroup
            aria-label={label || name}
            onValueChange={(value: string) => {
              field.onChange(value);
            }}
            value={field.value}
            className='flex flex-col space-y-3'
          >
            {options?.map((option) => (
              <Fragment key={option.value}>
                <FormItem
                  data-field={name}
                  className='flex items-start space-x-3 space-y-0 gap-0 RemoteFlows__RadioField__Item'
                >
                  <FormControl>
                    <RadioGroupItem
                      value={option.value}
                      className='RemoteFlows__RadioField__Input'
                      disabled={option.disabled}
                    />
                  </FormControl>
                  <div>
                    <FormLabel className='font-normal mb-0 RemoteFlows__RadioField__Label'>
                      {option.label}
                    </FormLabel>
                    {option.description && (
                      <FormDescription className='mt-2'>
                        {option.description}
                      </FormDescription>
                    )}
                  </div>
                </FormItem>
              </Fragment>
            ))}
          </RadioGroup>
        </FormControl>
        {fieldState.error && <FormMessage />}
      </FormItem>
    </fieldset>
  );
};
