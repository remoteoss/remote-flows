import { FormField } from '@/src/components/ui/form';
import { useFormFields, useTransformer } from '@/src/context';
import { Components } from '@/src/types/remoteFlows';
import {
  useFormContext,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
} from 'react-hook-form';
import { TelFieldComponentProps, TelFieldDataProps } from '@/src/types/fields';
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';

export type Country = {
  name: string;
  dialCode: string;
  pattern: string;
  areaCodes?: string[];
};

/**
 * Removes all spaces from input.
 */
function removeSpaces(value: string) {
  return value.replace(/\s/g, '');
}

function getStructuredNumberFromInternationalNumber(
  internationalPhoneNumber: string = '',
  country?: Country,
) {
  const baseRegex = new RegExp(
    `^(\\+|00)(\\d{${country?.dialCode?.length ?? 0}})(.*)$`,
  );
  const baseMatch = internationalPhoneNumber?.match(baseRegex);

  if (!baseMatch) {
    return {
      prefix: '',
      dialCode: '',
      phoneNumber: internationalPhoneNumber,
    };
  }

  const [, plusOrCallPrefix, dialCode, phoneNumber] = baseMatch;

  return {
    prefix: plusOrCallPrefix,
    dialCode,
    phoneNumber,
  };
}

function getCountryFromPhoneNumber(
  {
    dialCodes,
    dialCodeMaxLength,
  }: ReturnType<typeof getCountryDataByCountryCode>,
  internationalPhoneNumber: string,
) {
  const { prefix } = getStructuredNumberFromInternationalNumber(
    internationalPhoneNumber,
  );

  if (!prefix) {
    return undefined;
  }

  // Try longest dial codes first - critical for US/Canada
  for (let i = dialCodeMaxLength + prefix.length; i > prefix.length; i--) {
    const dialCode = internationalPhoneNumber.slice(prefix.length, i);

    if (dialCodes[dialCode]) {
      return dialCodes[dialCode];
    }
  }

  return undefined;
}

/**
 * Creates a map of dial codes (including area codes) to country objects.
 * Handles countries like US/Canada that share +1 with different area codes.
 */
export function getCountryDataByCountryCode(countries: Country[]) {
  const dialCodes: Record<string, Country> = {};
  let dialCodeMaxLength = 0;

  countries.forEach((country) => {
    if (country.areaCodes) {
      // For countries with area codes (e.g., +1204, +1226)
      country.areaCodes.forEach((areaCode) => {
        const code = country.dialCode + areaCode;
        dialCodes[code] = country;
        if (code.length > dialCodeMaxLength) {
          dialCodeMaxLength = code.length;
        }
      });
    } else {
      // For countries with simple dial codes (e.g., +44, +351)
      dialCodes[country.dialCode] = country;
      if (country.dialCode.length > dialCodeMaxLength) {
        dialCodeMaxLength = country.dialCode.length;
      }
    }
  });

  return { dialCodes, dialCodeMaxLength };
}

function getAreaCodesFromPattern(pattern: string = '') {
  const codeGroupPattern = /\(([^)]+)\)/g;
  const groups = pattern.match(codeGroupPattern);

  if (groups?.length === 2) {
    return groups[1].replace(/\(|\)/g, '').split('|');
  }

  return undefined;
}

function transformSchemaToCountries(
  options: Array<{
    value: string;
    label: string;
    meta: { countryCode: string };
    pattern: string;
  }>,
): Country[] {
  return options.map((option) => ({
    name: option.label,
    dialCode: option.meta.countryCode,
    pattern: option.pattern,
    areaCodes: getAreaCodesFromPattern(option.pattern),
  }));
}

export function TelFieldRenderer({
  field,
  fieldState,
  fieldData,
  component: Component,
  onChangeCountryCode,
  onChangePhoneNumber,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  fieldState: ControllerFieldState;
  fieldData: TelFieldDataProps;
  component: React.ComponentType<TelFieldComponentProps>;
  onChangeCountryCode?: (newCountry: Country) => void;
  onChangePhoneNumber?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { value: internationalPhoneNumber } = field;
  const { options } = fieldData;

  const countries = useMemo(
    () => transformSchemaToCountries(options),
    [options],
  );

  const countriesByCountryCode = useMemo(
    () => getCountryDataByCountryCode(countries),
    [countries],
  );

  // Track if the country change was due to manual selection
  const isManualSelectionRef = useRef(false);

  // Use state to track country, so manual selection is preserved
  const [country, setCountry] = useState<Country | undefined>(() =>
    getCountryFromPhoneNumber(
      getCountryDataByCountryCode(countries),
      internationalPhoneNumber || '',
    ),
  );

  // Re-detect country when phone number changes externally (e.g., form reset or area code typed)
  useEffect(() => {
    // Reset manual selection flag if field is cleared
    if (!internationalPhoneNumber || internationalPhoneNumber === '+') {
      isManualSelectionRef.current = false;
    }

    if (isManualSelectionRef.current) {
      return;
    }

    const detected = getCountryFromPhoneNumber(
      countriesByCountryCode,
      internationalPhoneNumber || '',
    );
    setCountry(detected);
  }, [internationalPhoneNumber, countriesByCountryCode]);

  const { prefix, phoneNumber: nationalPhoneNumber } = useMemo(
    () =>
      getStructuredNumberFromInternationalNumber(
        internationalPhoneNumber,
        country,
      ),
    [internationalPhoneNumber, country],
  );

  const handleCountryCodeChange = useCallback(
    (newCountry: Country) => {
      if (!newCountry) return;
      const newValue = `+${newCountry.dialCode}${nationalPhoneNumber}`;

      // Mark as manual selection to prevent useEffect from overriding
      isManualSelectionRef.current = true;

      // Update country state to preserve manual selection
      setCountry(newCountry);

      // Update React Hook Form state
      field.onChange(newValue);

      // Call optional external onChange
      if (onChangeCountryCode) {
        onChangeCountryCode(newCountry);
      }
    },
    [nationalPhoneNumber, field, onChangeCountryCode],
  );

  const handlePhoneNumberChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const valueWithoutSpaces = removeSpaces(event.target.value);
      let newValue: string;
      if (country) {
        newValue = `${prefix}${country.dialCode}${valueWithoutSpaces}`;
      } else {
        newValue = `${prefix}${valueWithoutSpaces}`;
      }
      // Update React Hook Form state
      field.onChange(newValue);

      // Call optional external onChange
      if (onChangePhoneNumber) {
        const syntheticEvent = {
          target: { value: newValue, name: field.name },
        } as React.ChangeEvent<HTMLInputElement>;
        onChangePhoneNumber(syntheticEvent);
      }
    },
    [country, prefix, field, onChangePhoneNumber],
  );

  const fieldDataWithComputedValues = useMemo(
    () => ({
      ...fieldData,
      onChangeCountryCode: handleCountryCodeChange,
      onChangePhoneNumber: handlePhoneNumberChange,
      currentCountry: country,
      nationalPhoneNumber,
    }),
    [
      fieldData,
      handleCountryCodeChange,
      handlePhoneNumberChange,
      country,
      nationalPhoneNumber,
    ],
  );

  return (
    <Component
      field={field}
      fieldState={fieldState}
      fieldData={fieldDataWithComputedValues}
    />
  );
}

export type TelFieldProps = TelFieldDataProps & {
  name: string;
  component?: Components['tel'];
};

export function TelField({
  name,
  description,
  label,
  onChangeCountryCode,
  onChangePhoneNumber,
  component,
  ...rest
}: TelFieldProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();
  const transformHtml = useTransformer();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const Component = component || components.tel;
        if (!Component) {
          throw new Error(`Tel component not found for field ${name}`);
        }

        const customTelFieldProps: TelFieldDataProps = {
          name,
          description,
          label,
          transformHtml,
          ...rest,
        };

        return (
          <TelFieldRenderer
            field={field}
            fieldState={fieldState}
            fieldData={customTelFieldProps}
            component={Component}
            onChangeCountryCode={onChangeCountryCode}
            onChangePhoneNumber={onChangePhoneNumber}
          />
        );
      }}
    />
  );
}
