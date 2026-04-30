import { ReactNode } from 'react';
import { sanitizeHtml } from './utils';

/**
 * INTERNAL helper function to transform HTML descriptions into React components.
 * Used internally by FormDescription and FieldSetField.
 *
 * NOT EXPORTED - Partners should implement their own version if needed.
 * This allows partners full control over HTML handling decisions.
 *
 * @param description - The HTML description string
 * @param transformer - Optional transformer function from context
 * @returns React elements or sanitized HTML
 *
 * @internal
 */
export function transformDescription(
  description: string,
  transformer?: (html: string) => ReactNode,
): ReactNode {
  if (transformer) {
    return transformer(description);
  }
  // Fallback to sanitized HTML when no transformer provided
  return (
    <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }} />
  );
}
