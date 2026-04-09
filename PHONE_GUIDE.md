# Building a Split Phone Number Input for React Hook Form

## Overview

This guide explains how to build a phone number input component that:
- Splits the UI into **country code select** + **national number input**
- Stores the **full international number** in form state (e.g., `+213659441270`)
- Validates against JSON schema patterns with country-specific rules
- Handles countries with area codes (e.g., US/Canada with `+1`)
- Integrates with your existing React Hook Form architecture

## Architecture

```
TelField (wrapper component)
  ↓ Uses React Hook Form's Controller
  ↓ Passes field, fieldState, fieldData
TelInput (split UI component)
  ↓ Manages country detection and splitting
  ↓ Renders CountryCodeSelect + NumberInput
  ↓ Updates via field.onChange()
  ↓ Hidden input stores full international number
```

## Core Helper Functions

### 1. Build Country Lookup Map

```typescript
// helpers.ts
export type Country = {
  name: string;
  dialCode: string;
  pattern: string;
  areaCodes?: string[];
};

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
```

### 2. Split International Number

```typescript
/**
 * Extracts prefix (+), dial code, and national number from international format.
 */
export function getStructuredNumberFromInternationalNumber(
  internationalPhoneNumber: string = '',
  country?: Country
) {
  const baseRegex = new RegExp(
    `^(\\+|00)(\\d{${country?.dialCode?.length ?? 0}})(.*)$`
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
```

### 3. Detect Country (Longest Match First!)

```typescript
/**
 * Identifies country from international number.
 * CRITICAL: Tries longest dial codes first (handles +1204 before +1).
 */
export function getCountryFromPhoneNumber(
  { dialCodes, dialCodeMaxLength }: ReturnType<typeof getCountryDataByCountryCode>,
  internationalPhoneNumber: string
) {
  const { prefix } = getStructuredNumberFromInternationalNumber(internationalPhoneNumber);

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
```

### 4. Extract Area Codes from Pattern

```typescript
/**
 * Extracts area codes from regex pattern.
 * Example: "^(\\+1)(204|226|236)[0-9]{6,}$" → ["204", "226", "236"]
 */
export function getAreaCodesFromPattern(pattern: string = '') {
  const codeGroupPattern = /\(([^)]+)\)/g;
  const groups = pattern.match(codeGroupPattern);

  if (groups?.length === 2) {
    return groups[1].replace(/\(|\)/g, '').split('|');
  }

  return undefined;
}
```

### 5. Utility Functions

```typescript
/**
 * Removes all spaces from input.
 */
export function removeSpaces(value: string) {
  return value.replace(/\s/g, '');
}

/**
 * Transforms JSON schema options into Country objects.
 */
export function transformSchemaToCountries(
  options: Array<{
    value: string;
    label: string;
    meta: { countryCode: string };
    pattern: string;
  }>
): Country[] {
  return options.map((option) => ({
    name: option.label,
    dialCode: option.meta.countryCode,
    pattern: option.pattern,
    areaCodes: getAreaCodesFromPattern(option.pattern),
  }));
}
```

## Main Component Implementation

```typescript
// TelInput.tsx
import { useState, useEffect } from 'react';
import type { ControllerRenderProps, ControllerFieldState, FieldValues } from 'react-hook-form';
import type { TelFieldComponentProps } from '@/src/types/fields';
import {
  getCountryDataByCountryCode,
  getCountryFromPhoneNumber,
  getStructuredNumberFromInternationalNumber,
  removeSpaces,
  transformSchemaToCountries,
} from './helpers';
import { CountryCodeSelect } from './CountryCodeSelect';
import { NumberInput } from './NumberInput';

export function TelInput({
  field,
  fieldState,
  fieldData,
}: TelFieldComponentProps) {
  const { value: internationalPhoneNumber, onChange, onBlur } = field;
  const { error, isTouched } = fieldState;
  const { name, label, description, options } = fieldData;

  // Transform schema options to Country objects
  const countries = transformSchemaToCountries(options);
  const countriesByCountryCode = getCountryDataByCountryCode(countries);

  // Detect current country from international number
  const [country, setCountry] = useState(
    getCountryFromPhoneNumber(countriesByCountryCode, internationalPhoneNumber || '')
  );

  // Re-detect country if value changes externally (e.g., form reset)
  useEffect(() => {
    const detected = getCountryFromPhoneNumber(
      countriesByCountryCode,
      internationalPhoneNumber || ''
    );
    setCountry(detected);
  }, [internationalPhoneNumber, countriesByCountryCode]);

  // Split the international number into parts
  const { prefix, phoneNumber: nationalPhoneNumber } =
    getStructuredNumberFromInternationalNumber(internationalPhoneNumber, country);

  // Handle country code change
  function handleCountryCodeChange(newCountry: typeof country) {
    if (!newCountry) return;
    
    const newValue = `+${newCountry.dialCode}${nationalPhoneNumber}`;
    onChange(newValue);
    setCountry(newCountry);
  }

  // Handle national number change
  function handlePhoneNumberChange(event: React.ChangeEvent<HTMLInputElement>) {
    const valueWithoutSpaces = removeSpaces(event.target.value);

    let newValue: string;
    if (country) {
      // Preserve prefix and dial code
      newValue = `${prefix}${country.dialCode}${valueWithoutSpaces}`;
    } else {
      // Unknown country - just preserve prefix
      newValue = `${prefix}${valueWithoutSpaces}`;
    }

    onChange(newValue);
  }

  // Determine which fields have errors
  const fieldsWithErrors: ('COUNTRY_CODE' | 'PHONE_NUMBER')[] = [];
  if (isTouched && error) {
    if (!country) {
      fieldsWithErrors.push('COUNTRY_CODE');
    }
    if (error) {
      fieldsWithErrors.push('PHONE_NUMBER');
    }
  }

  const hasError = fieldsWithErrors.length > 0;
  const errorIsOnCountryCode = fieldsWithErrors.includes('COUNTRY_CODE');
  const errorIsOnPhoneNumber = fieldsWithErrors.includes('PHONE_NUMBER');

  return (
    <div className="space-y-2">
      {/* Fieldset with both inputs */}
      <fieldset
        aria-label={label}
        aria-describedby={description ? `${name}-description` : undefined}
        className="flex gap-2"
      >
        {/* Country Code Select (fixed 190px width) */}
        <div style={{ width: '190px' }}>
          <CountryCodeSelect
            name={`${name}-country-code`}
            label="Country code"
            value={country}
            options={countries}
            hasError={errorIsOnCountryCode}
            onChange={handleCountryCodeChange}
            onBlur={onBlur}
          />
        </div>

        {/* National Number Input (flexible width) */}
        <div className="flex-1">
          <NumberInput
            name={`${name}-national-number`}
            label={label || 'Phone number'}
            placeholder={label || 'Phone number'}
            value={nationalPhoneNumber}
            hasError={errorIsOnPhoneNumber}
            onChange={handlePhoneNumberChange}
            onBlur={onBlur}
            maxLength={30}
          />
        </div>
      </fieldset>

      {/* Description */}
      {description && (
        <p id={`${name}-description`} className="text-sm text-gray-600">
          {description}
        </p>
      )}

      {/* Error Message */}
      {hasError && error && (
        <p className="text-sm text-red-600" role="alert">
          {error.message}
        </p>
      )}

      {/* Hidden input for form submission (CRITICAL!) */}
      <input
        type="hidden"
        name={name}
        value={internationalPhoneNumber || ''}
      />
    </div>
  );
}
```

## Integration with Your Existing Architecture

### Your Current TelField Wrapper (No Changes Needed!)

```typescript
// Your existing TelField.tsx - works as-is!
export function TelField({
  name,
  description,
  label,
  onChange,
  component,
  ...rest
}: TelFieldDataProps) {
  const { components } = useFormFields();
  const { control } = useFormContext();

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
          ...rest,
        };

        return (
          <TelFieldRenderer
            field={field}
            fieldState={fieldState}
            fieldData={customTelFieldProps}
            component={Component}
            onChange={onChange}
          />
        );
      }}
    />
  );
}
```

### Register Your Component

```typescript
// In your context/components registry
import { TelInput } from '@/src/components/TelInput/TelInput';

const components = {
  tel: TelInput,
  // ... other components
};
```

## TypeScript Types

```typescript
// types/fields.ts
import type { ControllerRenderProps, ControllerFieldState, FieldValues } from 'react-hook-form';
import type { JSFField, Components } from '@/src/types/remoteFlows';

export type TelFieldComponentProps = {
  field: ControllerRenderProps<FieldValues, string>;
  fieldState: ControllerFieldState;
  fieldData: TelFieldDataProps;
};

export type TelFieldDataProps = Omit<JSFField, 'options'> & {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  component?: Components['tel'];
  options: Array<{
    value: string;
    label: string;
    meta: {
      countryCode: string;
    };
    pattern: string;
  }>;
};
```

## Usage Example

```typescript
// In your form
<TelField
  name="mobile_number"
  label="Employee's phone number"
  description="Enter the employee's phone number, including country code, without spaces (e.g. +15389274785 for the USA)"
  options={[
    {
      value: "canada",
      label: "Canada",
      meta: { countryCode: "1" },
      pattern: "^(\\+1)(204|226|236|249|250|289|306|343)[0-9]{6,}$"
    },
    {
      value: "uk",
      label: "United Kingdom",
      meta: { countryCode: "44" },
      pattern: "^(\\+44)[0-9]{6,}$"
    },
    // ... more countries
  ]}
/>
```

## Validation Strategy

### Schema-Based Validation (Recommended)

```typescript
// validation.ts
import { z } from 'zod';
import type { Country } from './helpers';

export function createPhoneValidator(countries: Country[]) {
  return z.string()
    .min(1, 'Phone number is required')
    .refine((value) => {
      const countriesByCode = getCountryDataByCountryCode(countries);
      const country = getCountryFromPhoneNumber(countriesByCode, value);
      
      if (!country) {
        return false;
      }
      
      const pattern = new RegExp(country.pattern);
      return pattern.test(value);
    }, 'Please enter a valid phone number with country code (e.g. +15389274785)');
}

// In your form schema
const formSchema = z.object({
  mobile_number: createPhoneValidator(countries),
  // ... other fields
});
```

### Manual Validation

```typescript
// In your form setup
const { control } = useForm({
  resolver: (values) => {
    const errors: Record<string, any> = {};
    
    if (values.mobile_number) {
      const countriesByCode = getCountryDataByCountryCode(countries);
      const country = getCountryFromPhoneNumber(countriesByCode, values.mobile_number);
      
      if (!country) {
        errors.mobile_number = {
          type: 'manual',
          message: 'Invalid country code',
        };
      } else {
        const pattern = new RegExp(country.pattern);
        if (!pattern.test(values.mobile_number)) {
          errors.mobile_number = {
            type: 'manual',
            message: `Invalid ${country.name} phone number format`,
          };
        }
      }
    }
    
    return {
      values: Object.keys(errors).length === 0 ? values : {},
      errors,
    };
  },
});
```

## Key Data Flow

### User Types in National Number Input
```
User types "659441270"
  ↓
handlePhoneNumberChange() called
  ↓
Removes spaces → "659441270"
  ↓
Combines with country: "+213" + "659441270"
  ↓
Calls field.onChange("+213659441270")
  ↓
React Hook Form updates state
  ↓
Hidden input value = "+213659441270"
  ↓
Form submission sends: { mobile_number: "+213659441270" }
```

### User Changes Country Select
```
User selects "United Kingdom (+44)"
  ↓
handleCountryCodeChange({ dialCode: "44", ... })
  ↓
Combines new dial code with existing national number
  ↓
Calls field.onChange("+44659441270")
  ↓
useEffect detects change → updates country state
  ↓
UI re-renders with "+44" in select, "659441270" in input
```

## Critical Implementation Details

### 1. Longest Match First Algorithm
**Why:** US and Canada both use `+1`, but have different area codes (e.g., `+1204` for Canada Manitoba).

```typescript
// WRONG: This would match +1 first, losing area code
for (let i = 1; i <= dialCodeMaxLength; i++) { ... }

// CORRECT: Try longest codes first
for (let i = dialCodeMaxLength + prefix.length; i > prefix.length; i--) {
  const dialCode = internationalPhoneNumber.slice(prefix.length, i);
  if (dialCodes[dialCode]) {
    return dialCodes[dialCode]; // Returns +1204 before +1
  }
}
```

### 2. Single Source of Truth
- **Formik field state** stores: `"+213659441270"` (full international number)
- **UI displays**: Country select `"+213"` + National input `"659441270"`
- **Form submits**: `{ mobile_number: "+213659441270" }`

The split is purely visual. The hidden input ensures the form submission gets the full value.

### 3. State Synchronization
```typescript
// Re-detect country when value changes externally (form reset, prefill)
useEffect(() => {
  const detected = getCountryFromPhoneNumber(countriesByCode, internationalPhoneNumber);
  setCountry(detected);
}, [internationalPhoneNumber, countriesByCode]);
```

## Testing

```typescript
// TelInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { TelInput } from './TelInput';

const mockCountries = [
  {
    value: 'canada',
    label: 'Canada',
    meta: { countryCode: '1' },
    pattern: '^(\\+1)(204|226)[0-9]{6,}$',
  },
  {
    value: 'uk',
    label: 'United Kingdom',
    meta: { countryCode: '44' },
    pattern: '^(\\+44)[0-9]{6,}$',
  },
];

function TestWrapper() {
  const { control } = useForm({
    defaultValues: { mobile_number: '+12046551234' }
  });
  
  return (
    <form>
      <TelInput
        field={/* ... */}
        fieldState={/* ... */}
        fieldData={{
          name: 'mobile_number',
          label: 'Phone',
          options: mockCountries,
        }}
      />
    </form>
  );
}

test('splits international number correctly', () => {
  render(<TestWrapper />);
  
  expect(screen.getByText('+1')).toBeInTheDocument(); // Country code
  expect(screen.getByDisplayValue('6551234')).toBeInTheDocument(); // National number
});

test('updates value when country changes', () => {
  render(<TestWrapper />);
  
  const select = screen.getByLabelText('Country code');
  fireEvent.change(select, { target: { value: '44' } });
  
  const hidden = screen.getByRole('textbox', { hidden: true });
  expect(hidden).toHaveValue('+446551234');
});
```

## Troubleshooting

### Issue: Country not detected
**Cause:** Area codes not extracted from pattern correctly.
**Fix:** Verify `getAreaCodesFromPattern()` matches your pattern format.

### Issue: Split inputs show wrong values
**Cause:** Country detection failing or splitting logic incorrect.
**Fix:** Debug `getCountryFromPhoneNumber()` with your test data.

### Issue: Form submits empty value
**Cause:** Hidden input not rendered or name mismatch.
**Fix:** Verify hidden input has `name={name}` matching your field name.

### Issue: Validation not working
**Cause:** Pattern regex doesn't match your number format.
**Fix:** Test patterns with: `new RegExp(pattern).test(phoneNumber)`.

## Performance Optimization

```typescript
// Memoize country detection
const countriesByCountryCode = useMemo(
  () => getCountryDataByCountryCode(countries),
  [countries]
);

// Memoize structured number
const { prefix, phoneNumber: nationalPhoneNumber } = useMemo(
  () => getStructuredNumberFromInternationalNumber(internationalPhoneNumber, country),
  [internationalPhoneNumber, country]
);
```

## Summary

✅ **Store full international number** in React Hook Form state
✅ **Split UI** for better UX (country select + national input)
✅ **Longest match first** algorithm for shared dial codes
✅ **Hidden input** for form submission
✅ **Schema-based validation** with country-specific patterns
✅ **No changes** to your existing TelField wrapper architecture

The key insight: The two visible inputs are controlled by the single international number in form state. Changes in either input reconstruct the full number and update the form state via `field.onChange()`.
