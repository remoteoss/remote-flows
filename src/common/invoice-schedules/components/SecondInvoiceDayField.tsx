import { useFormContext } from 'react-hook-form';
import { SEMI_MONTHLY_CYCLE_GAP_DAYS } from '@/src/common/invoice-schedules/constants';
import { toOrdinal } from '@/src/common/invoice-schedules/utils';
import {
  FormControl,
  FormFieldNameProvider,
  FormItem,
  FormLabel,
} from '@/src/components/ui/form';
import { Select, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { JSFCustomComponentProps } from '@/src/types/remoteFlows';

const FIRST_INVOICE_DAY_NAME = 'semi_monthly_settings.first_invoice_day';
const DEFAULT_FIRST_INVOICE_DAY = 1;

export function SecondInvoiceDayField({
  name,
  label,
}: JSFCustomComponentProps) {
  const { watch } = useFormContext();
  const firstDay =
    Number(watch(FIRST_INVOICE_DAY_NAME)) || DEFAULT_FIRST_INVOICE_DAY;
  const secondDay = firstDay + SEMI_MONTHLY_CYCLE_GAP_DAYS;
  const secondDayLabel = `${toOrdinal(secondDay)} of the month`;

  return (
    <FormFieldNameProvider name={name}>
      <FormItem
        data-field={name}
        className={`RemoteFlows__SelectField__Item__${name}`}
      >
        <FormLabel className='RemoteFlows__SelectField__Label'>
          {label}
        </FormLabel>
        <FormControl>
          <Select value={String(secondDay)} disabled>
            <SelectTrigger
              className='RemoteFlows__SelectField__Trigger'
              aria-label={label}
            >
              <span className='absolute'>
                <SelectValue>{secondDayLabel}</SelectValue>
              </span>
            </SelectTrigger>
          </Select>
        </FormControl>
      </FormItem>
    </FormFieldNameProvider>
  );
}
