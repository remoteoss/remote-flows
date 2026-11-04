import { useFormContext } from 'react-hook-form';
import { FormField } from '@/src/components/ui/form';

import { useFormFields, useTransformer } from '@/src/context';
import { Components, JSFField, $TSFixMe } from '@/src/types/remoteFlows';
import { getMinStartDate } from '@/src/components/form/utils';

export type DatePickerFieldProps = JSFField & {
  onChange?: (value: $TSFixMe) => void;
  component?: Components['date'];
};

function toValidDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function DatePickerField({
  description,
  label,
  name,
  minDate,
  maxDate,
  onChange,
  component,
  ...rest
}: DatePickerFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();
  const transformHtml = useTransformer();

  let minDateValue: Date | undefined;
  if (rest.meta?.mot && typeof rest.meta.mot === 'number') {
    minDateValue = getMinStartDate(rest.meta.mot);
  } else if (typeof minDate === 'string') {
    minDateValue = toValidDate(`${minDate}T00:00:00`);
  }

  let maxDateValue: Date | undefined;
  if (maxDate) {
    maxDateValue = toValidDate(`${maxDate}T23:59:59`);
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const Component = component || components?.date;

        if (!Component) {
          throw new Error(`Date picker component not found for field ${name}`);
        }

        const customDatePickerFieldProps = {
          description,
          label,
          name,
          onChange,
          transformHtml,
          ...(minDateValue && { minDate: minDateValue.toISOString() }),
          ...(maxDateValue && { maxDate: maxDateValue.toISOString() }),
          ...rest,
        };
        return (
          <Component
            field={{
              ...field,
              onChange: (value: $TSFixMe) => {
                field.onChange(value);
                onChange?.(value);
              },
            }}
            fieldState={fieldState}
            fieldData={customDatePickerFieldProps}
          />
        );
      }}
    />
  );
}
