/* eslint-disable @typescript-eslint/no-explicit-any */
import get from 'lodash/get';

const textInputTypes = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  SELECT: 'select',
  COUNTRIES: 'countries',
  TEL: 'tel',
  EMAIL: 'email',
  MONEY: 'money',
  DATE: 'date',
  DATE_RANGE: 'date-range',
  CURRENCIES: 'currencies',
  TIME: 'time',
} as const;

const checkboxTypes = {
  CHECKBOX: 'checkbox',
  ACK_CHECK: 'ack-check',
} as const;

const supportedTypes = {
  FILE: 'file',
  RADIO: 'radio',
  /** @deprecated */
  RADIO_CARD: 'radio-card',
  GROUP_ARRAY: 'group-array',
  EXTRA: 'extra',
  STATEMENT: 'statement',
  HIDDEN: 'hidden',
  FIELDSET: 'fieldset',
  FIELDSET_FLAT: 'fieldset-flat',
  WORK_SCHEDULE: 'work-schedule',
  WORK_WEEK_SCHEDULE: 'work-week-schedule',
  /** @deprecated we still display benefits in read-only contract details view, but never in any form */
  BENEFITS: 'benefits',
  SIGNATURE: 'signature',
  SELECT_MULTIPLE: 'select-multiple',
  ...textInputTypes,
  ...checkboxTypes,
} as const;

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function convertToValidCost(value: string) {
  return parseFloat(value.replace(/,/g, ''));
}

function convertToCents(amount?: number | string | string[] | null | boolean) {
  if (
    amount == null ||
    amount === '' ||
    Number.isNaN(amount) ||
    Array.isArray(amount) ||
    typeof amount === 'boolean'
  ) {
    return null;
  }

  let validAmount: number;

  if (typeof amount === 'string') {
    validAmount = convertToValidCost(amount);
  } else {
    validAmount = amount;
  }

  return round(validAmount * 100);
}

export function convertFromCents(amount?: number | string | null) {
  if (amount == null || Number.isNaN(amount)) return null;

  let normalizedValue: number;

  if (typeof amount === 'string') {
    normalizedValue = convertToValidCost(amount || '0');
  } else {
    normalizedValue = amount;
  }

  return round(normalizedValue / 100);
}

const trimStringValues = (values: Record<string, any>) =>
  Object.entries(values || {}).reduce<Record<string, any>>(
    (result, [key, value]) => {
      if (typeof value === 'object') {
        result[key] = trimStringValues(value || {});
      } else result[key] = typeof value === 'string' ? value.trim() : value;
      return result;
    },
    {},
  );

function convertEmptyStringsToNull(values: Record<string, any>) {
  const result: Record<string, any> = {};

  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === 'object') {
      result[key] = convertEmptyStringsToNull(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((val) =>
        typeof val === 'object' ? convertEmptyStringsToNull(val) : val,
      );
    } else {
      result[key] = value === '' ? null : value;
    }
  });

  return result;
}

/**
 * Given a list of form values, modify the ones that are readOnly,
 * based on their field config, by adding its defaultValue.
 * This is needed to support readOnly fields that are also conditional
 * based on the "pivotName" workaround.
 * @param {Object} values - List with form values { name: value }.
 * @param {Array} fields - Respective form fields configuration.
 */
function prefillReadOnlyFields(values: Record<string, any>, fields: any[]) {
  const newValues: Record<string, any> = {};

  fields.forEach((field) => {
    const fieldName = field.name;

    if (
      !Object.prototype.hasOwnProperty.call(values, fieldName!) &&
      !(field.type === supportedTypes.FIELDSET && field.valueGroupingDisabled)
    )
      return;

    if (field.type === supportedTypes.FIELDSET && field.valueGroupingDisabled) {
      Object.assign(newValues, prefillReadOnlyFields(values, field.fields));
      return;
    }

    if (field.readOnly && field.defaultValue) {
      newValues[fieldName!] = field.defaultValue;
    } else {
      newValues[fieldName!] = values[fieldName!];
    }
  });

  return newValues;
}
/**
 * Recursively extracts fieldsets' fields values and maps them to the field name
 * For nested fields that are fieldsets with valueGroupingDisabled, the values
 * are extracted one level up
 *
 * @param {Array} fields - Fieldset fields configuration.
 * @param {Object} formValues - List with form values { name: value }.
 * @return {Object} – Raw form values mapped to the field name
 */
function extractFieldsetFieldsValues(
  fields: any[],
  formValues: Record<string, unknown>,
) {
  return fields.reduce<Record<string, any>>((nestedAcc, subField) => {
    const isFieldsetValueGroupingDisabled =
      subField.type === supportedTypes.FIELDSET &&
      subField.valueGroupingDisabled;

    if (isFieldsetValueGroupingDisabled) {
      Object.assign(
        nestedAcc,
        extractFieldsetFieldsValues(subField.fields, formValues),
      );
    } else if (
      Object.prototype.hasOwnProperty.call(formValues, subField.name!)
    ) {
      nestedAcc[subField.name!] = formValues[subField.name!];
    }

    return nestedAcc;
  }, {});
}

export const fieldTypesTransformations: Record<string, any> = {
  [supportedTypes.COUNTRIES]: {
    /**
     *
     * @param {Object} field - Field config that must contain field.countries
     * @param {String[]|String} value - Selected country
     *  - Current data (multi): an array of country names - eg: ['Peru', 'Germany']
     *  - Legacy data (multi): a string of country names - eg: "Peru,Germany"
     * @returns {String[]} Eg [{ label: 'PER', name: 'Peru' }]
     */
    transformValueFromAPI: (field: any) => (value: string) => {
      if (!field.multiple) {
        return value ?? '';
      }

      let countryNames;

      if (typeof value === 'string') {
        // support legacy data (when the fields were open text fields before)
        countryNames = value.split(',');
      } else {
        countryNames = value || [];
      }

      const countryValues = countryNames.map(
        // Return { name: countryName } as fallback to legacy data
        // The "name" is used at react-select, to connect to the country flag.
        (countryName) =>
          field.countries?.find?.(
            (country: any) => 'name' in country && country.name === countryName,
          ) || {
            name: countryName,
          },
      );

      return countryValues;
    },
    /**
     * @param {String[] | { name: String }[]} value
     *  - Excepted: array of strings.
     *  - Edge cases: array of objects. (when using dangerousTransformValue)
     * @returns {String[]} - List of countries
     * @example expected: ['Peru', 'Germany'] -> ['Peru', 'Germany']
     * @example edge cases: [{name: 'Peru'}, {name: 'Germany'}] -> ['Peru', 'Germany']
     */
    transformValueToAPI:
      (field: any) => (selectedCountries: string[] | { name: string }[]) => {
        if (!field.multiple || typeof selectedCountries === 'string') {
          return selectedCountries;
        }
        // NOTE: The value should be an array of strings, however legacy data can come as
        // an array of country objects. So, we always send an array of strings to normalize
        // the data (eg old form values being modified) until DB migration is done !5667
        return selectedCountries.map((option) =>
          typeof option === 'string' ? option : option.name,
        );
      },
    /**
     * Used for react-select, where the country selected is transformed
     * before saving on Formik state. Supports both solo and multi select
     * @param {Object|Object[]} selectedCountry[] - Current selected options
     * @param {String} selectedCountry[].value
     * @param {String} selectedCountry[].name
     * @param {String} selectedCountry[].label
     * @returns {String[]} - List of countries selected
     * @example
     * [{ value: 'Hungria' }] -> ['Hungria']
     */
    transformValue: (selectedCountry: any | any[]) => {
      // name or label are used in dragon. value is used in json-schema-form
      // TODO: it should be the same everywhere — read more at !5667
      const getCountryValue = (opt: any) =>
        opt?.name || opt?.value || opt?.label;
      return Array.isArray(selectedCountry)
        ? selectedCountry.map(getCountryValue) // support multi countries
        : getCountryValue(selectedCountry) || ''; // Fallback to '' in case user removes all countries
    },
  },
  [supportedTypes.NUMBER]: {
    transformValueToAPI: () => (value: string) => {
      // this prevents values with letters such as "2r" from being considered valid
      // if the input is invalid, number().cast will return NaN
      const castValue = Number(value);

      if (Number.isNaN(castValue)) {
        return value;
      }

      return castValue;
    },
  },
  [supportedTypes.MONEY]: {
    transformValueFromAPI: () => (value: string | number) =>
      convertFromCents(value) ?? '',
    transformValueToAPI: () => convertToCents,
  },
  [supportedTypes.RADIO]: {
    transformValueToAPI: (field: any) => (value: string) => {
      if (field.transformToBool) {
        return value === 'yes';
      }
      return value;
    },
  },
  [supportedTypes.SELECT]: {
    /**
     * Used for react-select, where the value is transformed
     * before saving on Formik state.
     * @param {Object | Object[]} option - Object structure with options config
     * @param {String} option[].value - Key for the API
     * @param {Array} this.options[].label - Friendly label
     * @example
     * [{ value: '1', label: 'One' }, { value: '2', label: 'Two' }] -> ["One", "Two"]
     * { value: '1', label: 'One' } -> "One"
     * {} -> ""
     */
    transformValue: (option: any | any[]) =>
      Array.isArray(option)
        ? option.map((opt) => opt.value) // multi-options
        : (option?.value ?? ''), // Fallback to '' in case user removes all options,
  },
};

export function parseFormValuesToAPI(
  formValues: Record<string, any> = {},
  fields: any[],
) {
  const filteredFields = fields.filter(
    (field) =>
      formValues[field.name!] ||
      (field.type === supportedTypes.FIELDSET && field.valueGroupingDisabled),
  );

  const parsedFormValues = filteredFields.reduce(
    (acc, field) => {
      switch (field.type) {
        case supportedTypes.FIELDSET: {
          const fieldset = field;
          if (fieldset.valueGroupingDisabled) {
            const nestedFormValues = extractFieldsetFieldsValues(
              fieldset.fields,
              formValues,
            );

            Object.assign(
              acc,
              parseFormValuesToAPI(nestedFormValues, fieldset.fields),
            );
          } else {
            acc[field.name!] = parseFormValuesToAPI(
              formValues[field.name!],
              fieldset.fields,
            );
          }
          break;
        }

        case supportedTypes.TEXTAREA:
        case supportedTypes.TEXT: {
          // Attempt to remove null bytes from form values - https://gitlab.com/remote-com/employ-starbase/tracker/-/issues/10670
          acc[field.name] = formValues[field.name].replace(/\0/g, '');
          break;
        }

        case supportedTypes.GROUP_ARRAY: {
          // NOTE: The field `name` in group arrays represents a path, but we only
          // need the last part of it which is represented by `nameKey`.

          const transformedFields = field?.fields?.().map((subField: any) => ({
            ...subField,
            name: subField.nameKey || '',
          }));

          // Null check necessary for case where no fields are set due to optional check
          const parsedFieldValues = formValues[field.name]?.map(
            (fieldValues: Record<string, any>) =>
              parseFormValuesToAPI(fieldValues, transformedFields),
          );

          acc[field.name] = parsedFieldValues;
          break;
        }
        case supportedTypes.EXTRA: {
          const extraField = field;
          if (extraField.includeValueToApi !== false) {
            const formValue = formValues[extraField.name];
            const fieldTransformValueToAPI =
              extraField?.transformValueToAPI ||
              fieldTypesTransformations[extraField.type]?.transformValueToAPI;

            // logErrorOnMissingComplimentaryParams(field);

            if (fieldTransformValueToAPI) {
              acc[extraField.name] = fieldTransformValueToAPI(field)(formValue);
              break;
            }

            acc[extraField.name] = formValue;
            break;
          }
          acc[extraField.name] = undefined;
          break;
        }
        default: {
          const formValue = formValues[field.name];
          const fieldTransformValueToAPI =
            field?.transformValueToAPI ||
            fieldTypesTransformations[field.type]?.transformValueToAPI;
          // logErrorOnMissingComplimentaryParams(field);
          if (fieldTransformValueToAPI) {
            acc[field.name] = fieldTransformValueToAPI(field)(formValue);
            break;
          }

          acc[field.name] = formValue;
          break;
        }
      }

      // this occurs when const === default in a JSON Schema for a given field.
      // without this, values such as money types won't use the correct value.
      if (field.forcedValue !== undefined) {
        acc[field.name!] = field.forcedValue;
      }

      return acc;
    },
    { ...formValues },
  );

  return parsedFormValues;
}

function isFieldVisible(field: any, formValues: Record<string, unknown>) {
  if (field.visibilityCondition) {
    return field.visibilityCondition(formValues);
  }

  if (typeof field.isVisible !== 'undefined') {
    return Boolean(field.isVisible);
  }

  return true;
}

function applyFieldDynamicProperties(
  field: any,
  values: Record<string, unknown> | Record<string, unknown>[],
) {
  if (field.calculateDynamicProperties) {
    return {
      ...field,
      ...(field.calculateDynamicProperties(values) || {}),
    };
  }

  return field;
}

function excludeValuesInvisible(
  values: any,
  fields: any[],
  keepTruthyInvisibleValues?: boolean,
  parentFieldKeyPath?: string,
) {
  const valuesAsked: Record<string, any> = {};

  fields
    .map((field) => applyFieldDynamicProperties(field, values))
    .forEach((field) => {
      let fieldKeyPath = field.name;
      if (parentFieldKeyPath) {
        fieldKeyPath = fieldKeyPath
          ? `${parentFieldKeyPath}.${field.name}`
          : parentFieldKeyPath;
      }

      const valueOfField = get(values, fieldKeyPath!);

      // keepTruthyInvisibleValues: false/undefined -> remove invisible field
      // keepTruthyInvisibleValues: true -> keep invisible field if it has a value
      if (
        !isFieldVisible(field, values) &&
        !(keepTruthyInvisibleValues && !!valueOfField)
      ) {
        return;
      }

      if (field.meta?.ignoreValue) {
        return;
      }

      if (field.type === 'fieldset' && field.valueGroupingDisabled) {
        Object.assign(
          valuesAsked,
          excludeValuesInvisible(
            values,
            field.fields,
            keepTruthyInvisibleValues,
            fieldKeyPath,
          ),
        );
      } else if (Array.isArray(field.fields)) {
        valuesAsked[field.name!] = excludeValuesInvisible(
          values,
          field.fields,
          keepTruthyInvisibleValues,
          fieldKeyPath,
        );
      } else {
        if (valueOfField === undefined) {
          return;
        }
        valuesAsked[field.name!] = valueOfField;
      }
    });

  return valuesAsked;
}

export function parseSubmitValues(
  formValues: Record<string, any>,
  fields: any[],
  config?: { keepInvisibleValues?: boolean },
) {
  const visibleFormValues = config?.keepInvisibleValues
    ? formValues
    : excludeValuesInvisible(formValues, fields);
  const convertedFormValues = parseFormValuesToAPI(visibleFormValues, fields);
  const formValuesWithTrimmedStrings = trimStringValues(convertedFormValues);
  const formValuesWithUndefined = convertEmptyStringsToNull(
    formValuesWithTrimmedStrings,
  );
  const valuesWithReadOnly = prefillReadOnlyFields(
    formValuesWithUndefined,
    fields,
  );
  return valuesWithReadOnly;
}

export function parseJSFToValidate(
  formValues: Record<string, any>,
  fields: any[],
  config: { isPartialValidation: boolean },
) {
  const valuesParsed = parseSubmitValues(formValues, fields, {
    /* We cannot exclude invisible fields (excludeValuesInvisible) because
        they are needed for conditional fields validations */
    keepInvisibleValues: config?.isPartialValidation,
  });
  return valuesParsed;
}
