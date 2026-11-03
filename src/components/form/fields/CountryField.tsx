import { useFormFields, useTransformer } from '@/src/context';
import { CountryOption } from '@/src/types/fields';
import { Components, JSFField, $TSFixMe } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../../ui/form';
import {
  applyGroupedCountryRules,
  isGroupedCountryOptions,
  matchSavedCountryValues,
} from './groupedCountrySelection';

type CountryFieldProps = JSFField & {
  options: CountryOption[];
  onChange?: (value: $TSFixMe) => void;
  $meta: {
    regions: Record<string, string[]>;
    subregions: Record<string, string[]>;
  };
  component?: Components['countries'];
};

/**
 * A `components.countries` override gets `field.value` as option values and a
 * `field.onChange` that already applies the Global/region selection rules.
 */
export function CountryField({
  label,
  name,
  options,
  defaultValue,
  description,
  onChange,
  $meta,
  component,
  ...rest
}: CountryFieldProps) {
  const { control } = useFormContext();
  const { components } = useFormFields();
  const transformHtml = useTransformer();

  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const Component = component || components.countries;
        if (!Component) {
          throw new Error(`Country component not found for field ${name}`);
        }

        const isGrouped = isGroupedCountryOptions(options);
        const fieldValue = isGrouped
          ? matchSavedCountryValues(field.value, options)
          : field.value;

        const customSelectFieldProps = {
          label,
          name,
          options,
          defaultValue,
          description,
          onChange,
          $meta,
          transformHtml,
          ...rest,
        };
        return (
          <Component
            field={{
              ...field,
              value: fieldValue,
              onChange: (value: $TSFixMe) => {
                const finalValue =
                  isGrouped && Array.isArray(value)
                    ? applyGroupedCountryRules(value, options)
                    : value;
                field.onChange(finalValue);
                onChange?.(finalValue);
              },
            }}
            fieldState={fieldState}
            fieldData={customSelectFieldProps}
          />
        );
      }}
    />
  );
}
