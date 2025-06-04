/* eslint-disable @typescript-eslint/no-explicit-any */
import { CalendarIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/src/components/ui/button';
import { Calendar } from '@/src/components/ui/calendar';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover';
import { useFormFields } from '@/src/context';
import { cn } from '@/src/lib/utils';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { PopoverClose } from '@radix-ui/react-popover';
import { format } from 'date-fns';

export type DatePickerFieldProps = JSFField & {
  onChange?: (value: any) => void;
  component?: Components['date'];
};

export function DatePickerField({
  description,
  label,
  name,
  minDate,
  onChange,
  component,
  ...rest
}: DatePickerFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const CustomDatePickerField = component || components?.date;

        if (CustomDatePickerField) {
          const customDatePickerFieldProps = {
            description,
            label,
            name,
            minDate,
            onChange,
            ...rest,
          };
          return (
            <CustomDatePickerField
              field={{
                ...field,
                onChange: (value: any) => {
                  field.onChange(value);
                  onChange?.(value);
                },
              }}
              fieldState={fieldState}
              fieldData={customDatePickerFieldProps}
            />
          );
        }
        return (
          <FormItem
            data-field={name}
            className={`flex flex-col RemoteFlows__DatePickerField__Item__${name}`}
          >
            <FormLabel className="RemoteFlows__DatePickerField__Label">
              {label}
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <div>
                    <Button
                      type="button"
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                      data-testid={`date-picker-button-${name}`}
                    >
                      {field.value && <>{format(field.value, 'yyyy-MM-dd')}</>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </div>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className={`w-auto p-0 RemoteFlows__DatepickerField__PopoverContent`}
                align="start"
              >
                <Calendar
                  mode="single"
                  className="RemoteFlows__DatepickerField__Calendar"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => {
                    field.onChange(date ? format(date, 'yyyy-MM-dd') : null);
                    onChange?.(date);
                  }}
                  defaultMonth={minDate ? new Date(minDate) : undefined}
                  components={{
                    DayContent: (props) => {
                      return (
                        <PopoverClose>{props.date.getDate()}</PopoverClose>
                      );
                    },
                  }}
                  {...(minDate && {
                    disabled: (date: Date) => date < new Date(minDate),
                  })}
                />
              </PopoverContent>
            </Popover>
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
            {fieldState.error && (
              <FormMessage className="RemoteFlows__DatePickerField__Error" />
            )}
          </FormItem>
        );
      }}
    />
  );
}
