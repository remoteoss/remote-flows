import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ValidationError } from 'yup';
import DOMPurify from 'dompurify';
import { Fields } from '@remoteoss/json-schema-form';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | undefined | null,
  symbol = '€',
): string {
  if (amount == null) {
    return '-';
  }

  const value = amount / 100;

  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type YupError = Pick<ValidationError, 'type' | 'errors'> & {
  inner: Record<string, YupError>[];
};

/**
 * Transforms a Yup ValidationError object into a more readable object. The format is as follows:
 *  {
 *    [fieldName]: {
 *      type: string,
 *      errors: string[],
 *      inner: YupError[],
 *    },
 *  }
 * @param errors
 * @returns
 */
export const transformYupErrorsIntoObject = (errors: ValidationError) => {
  const validationErrors: Record<string, YupError> = {};

  errors.inner.forEach((error: ValidationError) => {
    if (error.path !== undefined) {
      validationErrors[error.path] = {
        type: error.type,
        errors: error.errors,
        inner: error.inner.map((innerError) =>
          transformYupErrorsIntoObject(innerError),
        ),
      };
    }
  });

  return validationErrors;
};

/**
 * Debug utility to add version to window object
 * @param version - The version of the SDK
 */
export function debug(version: string) {
  window.RemoteFlowsSDK = {
    version,
  };
}

// Deduplicates rel values if necessary and appends noopener and noreferrer
const appendSecureRelValue = (rel: string | null) => {
  const attributes = new Set(rel ? rel.toLowerCase().split(' ') : []);

  attributes.add('noopener');
  attributes.add('noreferrer');

  return Array.from(attributes).join(' ');
};

if (DOMPurify.isSupported) {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const target = node.getAttribute('target');

    // set value of target to be _blank with rel, or keep as _self if already set
    if (node.tagName === 'A' && (!target || target !== '_self')) {
      node.setAttribute('target', '_blank');
      const rel = node.getAttribute('rel');
      node.setAttribute('rel', appendSecureRelValue(rel));
    }
  });
}

export const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
};

/**
 * Function to prettify form values. Returns a pretty value and label for each field.
 * @param values - Form values to prettify
 * @param fields - Form fields
 * @returns Prettified form values
 */
// @ts-expect-error need to check function return type
export function prettifyFormValues(
  values: Record<string, unknown>,
  fields: Fields | undefined,
) {
  if (!fields) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(values)
      // @ts-expect-error need to check function return type
      .map(([key, value]) => {
        if (value === undefined) {
          return [key, undefined];
        }

        const field = fields.find((field) => field.name === key);

        if (field?.isVisible === false || field?.deprecated) {
          return [key, undefined];
        }

        if (field?.type === 'radio' || field?.type === 'select') {
          const option = (
            field.options as Array<{ value: string; label: string }>
          ).find((option) => option.value === value);

          if (option) {
            return [
              key,
              {
                prettyValue: option?.label,
                label: field?.label,
                inputType: field?.type,
              },
            ];
          }
          return;
        }

        if (field?.type === 'checkbox' && field?.const) {
          return [
            key,
            { prettyValue: true, label: field.label, inputType: field?.type },
          ];
        }

        if (field?.type === 'countries' && Array.isArray(value)) {
          return [
            key,
            {
              prettyValue: value.join(),
              label: field.label,
              inputType: field?.type,
            },
          ];
        }

        if (field?.type === 'fieldset') {
          // @ts-expect-error need to check function return type
          const prettiedFieldset = prettifyFormValues(
            value as Record<string, unknown>,
            field.fields as Fields,
          );

          // Handles benefits fieldset in specific
          if (!prettiedFieldset.label && prettiedFieldset.value) {
            const prettyValue: Record<string, unknown> = {
              ...prettiedFieldset.value,
              label: field.label,
              inputType: field?.type,
            };
            return [key, prettyValue];
          }

          return [key, prettiedFieldset];
        }

        if (field?.type === 'money') {
          return [
            key,
            {
              prettyValue: value,
              label: field.label,
              inputType: field?.type,
              currency: field?.currency,
            },
          ];
        }

        if (field) {
          return [
            key,
            { prettyValue: value, label: field.label, inputType: field?.type },
          ];
        }
      })
      .filter(Boolean),
  );
}
