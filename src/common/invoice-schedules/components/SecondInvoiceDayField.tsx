import { useFormContext } from 'react-hook-form';
import { SEMI_MONTHLY_CYCLE_GAP_DAYS } from '@/src/common/invoice-schedules/constants';
import { FormFieldNameProvider } from '@/src/components/ui/form';
import { useFormFields } from '@/src/context';
import { JSFCustomComponentProps } from '@/src/types/remoteFlows';

const FIRST_INVOICE_DAY_NAME = 'semi_monthly_settings.first_invoice_day';
const DEFAULT_FIRST_INVOICE_DAY = 1;

const noop = () => {};

export function SecondInvoiceDayField({
  name,
  label,
  options,
  description,
}: JSFCustomComponentProps) {
  const { watch } = useFormContext();
  const { components } = useFormFields();
  const Select = components?.select;

  if (!Select) {
    throw new Error(`Select component not found for field ${name}`);
  }

  const firstDay =
    Number(watch(FIRST_INVOICE_DAY_NAME)) || DEFAULT_FIRST_INVOICE_DAY;
  const secondDay = firstDay + SEMI_MONTHLY_CYCLE_GAP_DAYS;

  return (
    <FormFieldNameProvider name={name}>
      <Select
        field={{
          name,
          value: String(secondDay),
          onChange: noop,
          onBlur: noop,
          ref: noop,
        }}
        fieldState={{
          invalid: false,
          isDirty: false,
          isTouched: false,
          isValidating: false,
        }}
        fieldData={{ name, label, description, options, disabled: true }}
      />
    </FormFieldNameProvider>
  );
}
