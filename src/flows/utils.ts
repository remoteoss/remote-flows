type ParsedRadioValues = Record<string, unknown>;

/**
 * Parses the form values to convert radio button values from 'yes'/'no' to boolean.
 *
 * @param values - The form values as a record of key-value pairs.
 * @param fieldKeys - An array of field keys that represent radio button fields.
 * @returns A new object with the parsed values, where radio button fields are converted to boolean.
 *
 * @example
 * const values = {
 *   ack: 'yes',
 *   confidential: 'no',
 *   username: 'john_doe',
 * };
 * const fieldKeys = ['ack', 'confidential'];
 * const parsedValues = parseFormRadioValues(values, fieldKeys);
 * // Output: { ack: true, confidential: false, username: 'john_doe' }
 */
export function parseFormRadioValues(
  values: Record<string, unknown>,
  fieldKeys: string[],
) {
  return Object.entries(values).reduce<ParsedRadioValues>(
    (acc, [key, value]) => {
      acc[key] = fieldKeys.includes(key) ? value === 'yes' : value;
      return acc;
    },
    {},
  );
}
