import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
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
import { cn } from '@/src/lib/utils';
import { PopoverClose } from '@radix-ui/react-popover';
import { format } from 'date-fns';

type DatePickerFieldProps = {
  description?: string;
  label: string;
  name: string;
};

export function DatePickerField({
  description,
  label,
  name,
}: DatePickerFieldProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={`flex flex-col RemoteFlows__DatePickerField__Item__${name}`}
        >
          <FormLabel className="RemoteFlows__DatePickerField__Label">
            {label}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <div className="w-fit">
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[240px] pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground',
                    )}
                  >
                    {field.value ? (
                      <>{format(field.value, 'yyyy-MM-dd')}</>
                    ) : (
                      <span>Pick a date</span>
                    )}
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
                selected={field.value}
                onSelect={field.onChange}
                components={{
                  DayContent: (props) => {
                    return <PopoverClose>{props.date.getDate()}</PopoverClose>;
                  },
                }}
                disabled={(date) => date < new Date('1900-01-01')}
              />
            </PopoverContent>
          </Popover>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
