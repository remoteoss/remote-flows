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

/**
 * Checks if a field can become computed based on allOf conditions.
 * Searches through all conditional "then" branches for x-jsf-logic-computedAttrs.
 */
function isConditionallyComputedField(
  fieldName: string,
  schema: Record<string, unknown>,
): boolean {
  const allOfRules = schema.allOf;
  if (!Array.isArray(allOfRules)) return false;
  // Check each allOf rule's "then" branch for computedAttrs on this field
  return allOfRules.some((rule) => {
    const thenBranch = rule.then;
    if (!thenBranch?.properties) return false;
    const fieldInThen = thenBranch.properties[fieldName];
    return fieldInThen?.['x-jsf-logic-computedAttrs'] !== undefined;
  });
}
/**
 * Checks if a field has static (unconditional) computed attributes.
 */
function hasStaticComputedAttrs(fieldSchema: Record<string, unknown>): boolean {
  return fieldSchema?.['x-jsf-logic-computedAttrs'] !== undefined;
}
/**
 * Finds all input money fields (excluding computed ones).
 * Checks both static properties and conditional allOf branches.
 */
export function findInputMoneyFields(
  schema: Record<string, unknown>,
): string[] {
  const properties = schema.properties || {};

  return Object.entries(properties)
    .filter(([fieldName, fieldSchema]) => {
      const isMoney =
        (
          fieldSchema as Record<string, unknown> & {
            'x-jsf-presentation': { inputType: string };
          }
        )?.['x-jsf-presentation']?.inputType === 'money';
      if (!isMoney) return false;
      // Check if field has static computed attributes
      if (hasStaticComputedAttrs(fieldSchema)) return false;
      // Check if field becomes computed in any allOf condition
      if (isConditionallyComputedField(fieldName, schema)) return false;
      return true;
    })
    .map(([fieldName]) => fieldName);
}
