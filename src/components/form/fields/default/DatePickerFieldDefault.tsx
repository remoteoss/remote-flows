import { Button } from '@/src/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { DatePickerComponentProps } from '@/src/types/fields';
import { CalendarIcon, XIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover';
import { cn } from '@/src/lib/utils';
import { Calendar } from '@/src/components/ui/calendar';
import { HelpCenter } from '@/src/components/shared/zendesk-drawer/HelpCenter';
import { useState } from 'react';

export function DatePickerFieldDefault({
  field,
  fieldData,
  fieldState,
}: DatePickerComponentProps) {
  const { name, label, description, minDate, maxDate, required } = fieldData;
  const isClearable = !required && Boolean(field.value);
  const minDateValue = minDate ? new Date(minDate) : undefined;
  const maxDateValue = maxDate ? new Date(maxDate) : undefined;
  const [open, setOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const fromYear = minDateValue ? minDateValue.getFullYear() : 1900;
  const toYear = Math.max(
    fromYear,
    maxDateValue ? maxDateValue.getFullYear() : currentYear + 10,
  );

  return (
    <FormItem
      data-field={name}
      className={`flex flex-col RemoteFlows__DatePickerField__Item__${name}`}
    >
      <FormLabel className='RemoteFlows__DatePickerField__Label'>
        {label}
      </FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <div className='relative'>
              <Button
                type='button'
                variant={'outline'}
                className={cn(
                  'w-full pl-3 text-left font-normal',
                  !field.value && 'text-muted-foreground',
                )}
                data-testid={`date-picker-button-${name}`}
              >
                {field.value && <>{format(field.value, 'yyyy-MM-dd')}</>}
                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
              </Button>
              {isClearable && (
                <button
                  type='button'
                  aria-label={`Clear ${label}`}
                  className='RemoteFlows__DatePickerField__Clear absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground'
                  onClick={(event) => {
                    event.stopPropagation();
                    field.onChange(undefined);
                  }}
                >
                  <XIcon className='size-4' />
                </button>
              )}
            </div>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent
          className={`w-auto p-0 RemoteFlows__DatepickerField__PopoverContent`}
          align='start'
        >
          <Calendar
            mode='single'
            captionLayout='dropdown'
            fromYear={fromYear}
            toYear={toYear}
            className='RemoteFlows__DatepickerField__Calendar'
            selected={field.value ? new Date(field.value) : undefined}
            onDayClick={(day) => {
              const formattedDate = format(day, 'yyyy-MM-dd');
              field.onChange(formattedDate);
              setOpen(false);
            }}
            defaultMonth={
              field.value
                ? new Date(field.value)
                : (maxDateValue ?? minDateValue)
            }
            disabled={(date: Date) => {
              if (minDateValue && date < minDateValue) {
                return true;
              }
              if (maxDateValue && date > maxDateValue) {
                return true;
              }
              return false;
            }}
          />
        </PopoverContent>
      </Popover>
      {description ? (
        <FormDescription
          helpCenter={<HelpCenter helpCenter={fieldData.meta?.helpCenter} />}
        >
          {description}
        </FormDescription>
      ) : null}
      {fieldState.error && (
        <FormMessage className='RemoteFlows__DatePickerField__Error' />
      )}
    </FormItem>
  );
}
