/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormContext } from 'react-hook-form';
import { FormField } from '@/src/components/ui/form';

import { useFormFields } from '@/src/context';
import { Components, JSFField } from '@/src/types/remoteFlows';
import { getMinStartDate } from '@/src/components/form/utils';

export type DatePickerFieldProps = JSFField & {
  onChange?: (value: any) => void;
  component?: Components['date'];
};

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

  let minDateValue: Date;
  if (rest.meta?.mot && typeof rest.meta.mot === 'number') {
    minDateValue = getMinStartDate(rest.meta.mot);
  } else if (typeof minDate === 'string') {
    minDateValue = new Date(`${minDate}T00:00:00`);
  }

  let maxDateValue: Date | undefined;
  if (maxDate) {
    maxDateValue = new Date(`${maxDate}T23:59:59`);
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
          ...(minDateValue && { minDate: minDateValue.toISOString() }),
          ...(maxDateValue && { maxDate: maxDateValue.toISOString() }),
          ...rest,
        };
        return (
          <Component
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
      }}
    />
  );
}
