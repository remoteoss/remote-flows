import { useFormFields } from '@/src/context';
import { $TSFixMe, Components, JSFField } from '@/src/types/remoteFlows';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { MultiSelect } from '@/src/components/ui/multi-select';
import { useState, useCallback, useMemo } from 'react';

type TaxCountriesFieldProps = JSFField & {
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  className?: string;
  onChange?: (value: $TSFixMe) => void;
  component?: Components['multi-select'];
  $meta?: {
    regions?: Record<string, string[]>;
    subregions?: Record<string, string[]>;
  };
};

// Constants for tax servicing countries logic
const GLOBAL_OPTION = { label: 'Global', value: 'GLOBAL', type: 'global' };
const AREA_TYPE = {
  REGIONS: 'regions',
  SUBREGIONS: 'subregions',
  COUNTRIES: 'countries',
};

export function TaxServicingCountriesField({
  label,
  name,
  options,
  defaultValue,
  description,
  onChange,
  component,
  $meta,
  ...rest
}: TaxCountriesFieldProps) {
  const { control } = useFormContext();
  const { components } = useFormFields();
  const [selected, setSelected] = useState<$TSFixMe[]>();

  // Enhanced options with regions/subregions/countries
  const enhancedOptions = useMemo(() => {
    const { regions = {}, subregions = {} } = $meta || {};

    const regionsOptions = [
      GLOBAL_OPTION,
      ...Object.keys(regions).map((region) => ({
        label: region,
        value: region,
        type: AREA_TYPE.REGIONS,
        category: 'Regions',
      })),
    ];

    const subregionsOptions = Object.keys(subregions).map((subregion) => ({
      label: subregion,
      value: subregion,
      type: AREA_TYPE.SUBREGIONS,
      category: 'Subregions',
    }));

    const countriesOptions =
      options?.map((option) => ({
        ...option,
        type: AREA_TYPE.COUNTRIES,
        category: 'Countries',
      })) || [];

    return [...regionsOptions, ...subregionsOptions, ...countriesOptions];
  }, [options, $meta]);

  // Enhanced change handler with regions/subregions logic
  const handleChange = useCallback(
    (rawValues: $TSFixMe[]) => {
      const { regions = {}, subregions = {} } = $meta || {};

      if (!rawValues?.length) {
        onChange?.([]);
        setSelected([]);
        return;
      }

      // Check if Global is being selected
      const isGlobalSelected = rawValues.some(
        (option) => option.value === GLOBAL_OPTION.value,
      );

      // If Global is selected, clear all other selections and only keep Global
      if (isGlobalSelected) {
        // If Global was already selected and user is trying to add more options, ignore the new selections
        if (selected?.some((option) => option.value === GLOBAL_OPTION.value)) {
          return; // Don't change anything if Global is already selected
        }

        // If Global is being selected for the first time, clear everything else
        onChange?.([GLOBAL_OPTION.value]);
        setSelected([GLOBAL_OPTION]);
        return;
      }

      // If Global is currently selected and user is trying to select other options, ignore them
      if (selected?.some((option) => option.value === GLOBAL_OPTION.value)) {
        return; // Don't allow other selections when Global is selected
      }

      // Track countries to prevent duplicates when multiple overlapping areas are selected
      const existingCountries = new Set();
      const updatedSelected = rawValues.flatMap((option) => {
        // If the selection is a country, add it directly
        if (option.type === AREA_TYPE.COUNTRIES) {
          existingCountries.add(option.value);
          return [option];
        }

        // For regions/subregions, look up their countries
        const lookupLabel = option.originalLabel || option.label;
        const areaCountries =
          option.type === AREA_TYPE.REGIONS
            ? regions[lookupLabel] || []
            : subregions[lookupLabel] || [];

        // Convert each country name into a country option object
        return areaCountries
          .filter((country) => !existingCountries.has(country))
          .map((country) => {
            existingCountries.add(country);
            return {
              label: country,
              value: country,
              type: AREA_TYPE.COUNTRIES,
              category: 'Countries',
            };
          });
      });

      // Extract just the country values for the form
      const countryValues = updatedSelected
        .filter((option) => option.type === AREA_TYPE.COUNTRIES)
        .map((option) => option.value);

      onChange?.(countryValues);
      setSelected(updatedSelected);
    },
    [$meta, onChange, selected], // Added selected to dependencies
  );

  return (
    <FormField
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const CustomSelectField = component || components?.['multi-select'];
        if (CustomSelectField) {
          const customSelectFieldProps = {
            label,
            name,
            options: enhancedOptions,
            defaultValue,
            description,
            onChange: handleChange,
            $meta,
            ...rest,
          };
          return (
            <CustomSelectField
              field={{
                ...field,
                onChange: (value: $TSFixMe) => {
                  field.onChange(value);
                  handleChange(value);
                },
              }}
              fieldState={fieldState}
              fieldData={customSelectFieldProps}
            />
          );
        }

        const selectedOptions =
          selected ||
          enhancedOptions.filter((option) =>
            field.value?.includes(option.value),
          );

        return (
          <FormItem
            data-field={name}
            className={`RemoteFlows__TaxCountriesField__Item__${name}`}
          >
            <FormLabel className='RemoteFlows__TaxCountriesField__Label'>
              {label}
            </FormLabel>
            <FormControl>
              <MultiSelect
                options={enhancedOptions}
                selected={selectedOptions}
                onChange={handleChange}
                {...rest}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {fieldState.error && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}
