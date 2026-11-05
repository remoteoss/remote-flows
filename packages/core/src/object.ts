/**
 * Gets a nested value from an object using a dot-notation path string.
 * Replacement for lodash.get with support for nested property access.
 * @param obj - The object to query
 * @param path - The path to the property (e.g., 'user.address.city')
 * @param defaultValue - The value to return if the resolved value is undefined
 * @returns The resolved value or defaultValue
 */
export function getNestedValue<T = unknown>(
  obj: unknown,
  path: string,
  defaultValue?: T,
): T | undefined {
  if (obj == null || typeof path !== 'string') {
    return defaultValue;
  }

  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = (result as Record<string, unknown>)[key];
  }

  return (result === undefined ? defaultValue : result) as T | undefined;
}
