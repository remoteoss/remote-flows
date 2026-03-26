import { Button } from '../ui/button';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { DatePickerComponentProps, HelpCenter } from '@remoteoss/remote-flows';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { cn } from '@remoteoss/remote-flows/internals';
import { Calendar } from '../ui/calendar';

export function DatePickerFieldDefault({
  field,
  fieldData,
  fieldState,
}: DatePickerComponentProps) {
  const { name, label, description, minDate, maxDate } = fieldData;
  const minDateValue = minDate ? new Date(minDate) : undefined;
  const maxDateValue = maxDate ? new Date(maxDate) : undefined;
  return (
    <FormItem
      data-field={name}
      className={`flex flex-col RemoteFlows__DatePickerField__Item__${name}`}
    >
      <FormLabel className='RemoteFlows__DatePickerField__Label'>
        {label}
      </FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <div>
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
            </div>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent
          className={`w-auto p-0 RemoteFlows__DatepickerField__PopoverContent`}
          align='start'
        >
          <Calendar
            mode='single'
            className='RemoteFlows__DatepickerField__Calendar'
            selected={field.value ? new Date(field.value) : undefined}
            onSelect={(date) => {
              field.onChange(date ? format(date, 'yyyy-MM-dd') : null);
            }}
            defaultMonth={minDateValue}
            components={{
              DayContent: (props) => {
                return <PopoverClose>{props.date.getDate()}</PopoverClose>;
              },
            }}
            disabled={(date: Date) => {
              if (minDateValue && date < minDateValue) return true;
              if (maxDateValue && date > maxDateValue) return true;
              return false;
            }}
          />
        </PopoverContent>
      </Popover>
      {description ? (
        <FormDescription>
          {description} <HelpCenter helpCenter={fieldData.meta?.helpCenter} />
        </FormDescription>
      ) : null}
      {fieldState.error && (
        <FormMessage className='RemoteFlows__DatePickerField__Error' />
      )}
    </FormItem>
  );
}
