import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ValidationError } from 'yup';
import DOMPurify from 'dompurify';
import { JSFFields, NestedMeta } from '@/src/types/remoteFlows';
import {
  NormalizedFieldError,
  normalizeFieldErrors,
} from '@/src/lib/mutations';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | undefined | null,
  currencyCode = 'EUR',
): string {
  if (amount == null) {
    return '-';
  }

  const value = amount / 100;

  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'symbol',
  }).format(value);
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

    if (node.tagName === 'A' && (!target || target !== '_self')) {
      const href = node.getAttribute('href');

      // Skip internal anchors (#section), relative URLs, and non-http protocols
      if (href && !href.startsWith('#') && /^https?:\/\//i.test(href)) {
        node.setAttribute('target', '_blank');
        const rel = node.getAttribute('rel');
        node.setAttribute('rel', appendSecureRelValue(rel));
      }
    }
  });
}

export const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
};

export const sanitizeHtmlWithImageErrorHandling = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Add onerror handler to all img tags to hide them if they fail to load
  const images = doc.querySelectorAll('img');
  images.forEach((img) => {
    img.setAttribute('onerror', "this.style.display='none'");
  });

  const modifiedHtml = doc.body.innerHTML;

  // Sanitize with DOMPurify, allowing onerror attribute
  // Note: The global afterSanitizeAttributes hook (defined above) will still apply
  // to add target="_blank" and rel="noopener noreferrer" to external links
  return DOMPurify.sanitize(modifiedHtml, {
    ADD_ATTR: ['target', 'onerror'],
  });
};

/**
 * Ensures base64 data has the correct data URI prefix for PDF content
 * @param base64Data - The base64 data string
 * @returns The base64 data with proper data URI prefix
 */
export const clearBase64Data = (base64Data: string) => {
  if (!base64Data) return '';

  const cleanedData = base64Data.trim();

  if (cleanedData.startsWith('data:application/pdf;base64,')) {
    return cleanedData;
  }

  if (cleanedData.startsWith('data:')) {
    return cleanedData;
  }

  return `data:application/pdf;base64,${cleanedData}`;
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
  fields: JSFFields | undefined,
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
            field.fields as JSFFields,
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

/**
 * Creates a structured error object with the error message and raw error object
 * @param message - The error message
 * @returns
 */
export function createStructuredError(message: string) {
  return {
    error: new Error(message),
    rawError: { message },
    fieldErrors: [],
  };
}

/**
 * Checks if the error is a structured error
 * @param err - The error
 * @returns True if the error is a structured error
 */
export function isStructuredError(err: unknown): err is {
  error: Error;
  rawError: Record<string, unknown>;
  fieldErrors: NormalizedFieldError[];
} {
  return (
    typeof err === 'object' &&
    err !== null &&
    'error' in err &&
    'rawError' in err &&
    'fieldErrors' in err
  );
}

/**
 * Handles the error for a step and optionally sets form field errors
 * @param err - The error
 * @param fieldsMeta - The fields metadata
 * @param form - Optional form instance to set field errors
 * @returns The structured error
 */
export function handleStepError(
  err: unknown,
  fieldsMeta?: NestedMeta,
  form?: {
    setError: (name: string, error: { type: string; message: string }) => void;
  },
): {
  error: Error;
  rawError: Record<string, unknown>;
  fieldErrors: NormalizedFieldError[];
} {
  // If it's already a structured error from mutateAsyncOrThrow
  if (isStructuredError(err)) {
    const normalizedFieldErrors = normalizeFieldErrors(
      err.fieldErrors || [],
      fieldsMeta,
    );

    // Automatically set form field errors if form is provided
    if (form) {
      setFormFieldErrors(form, normalizedFieldErrors);
    }

    return {
      error: err.error,
      rawError: err.rawError,
      fieldErrors: normalizedFieldErrors,
    };
  }

  // For unexpected errors, create a structured error
  const fallbackError = createStructuredError(
    err instanceof Error ? err.message : 'An unexpected error occurred',
  );

  return {
    ...fallbackError,
    fieldErrors: [], // No field errors for unexpected errors
  };
}

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

/**
 * Sets backend validation errors into react-hook-form state
 * Converts backend field paths to react-hook-form paths and sets errors
 *
 * @example
 * Backend: "provisional_start_date" → Form: "provisional_start_date"
 * Backend: "service_duration/expiration_date" → Form: "service_duration.expiration_date"
 * Backend: "benefits[0]/value" → Form: "benefits.0.value"
 *
 * @param form - The react-hook-form instance
 * @param fieldErrors - Array of normalized field errors from the backend
 */
export function setFormFieldErrors(
  form: {
    setError: (name: string, error: { type: string; message: string }) => void;
  },
  fieldErrors: NormalizedFieldError[],
): void {
  fieldErrors.forEach(({ field, messages }) => {
    try {
      // Convert backend field path to react-hook-form path
      // "/" → "." for nested objects
      // "[index]" → ".index" for arrays
      const formFieldPath = field
        .replace(/\//g, '.')
        .replace(/\[(\d+)\]/g, '.$1');

      form.setError(formFieldPath, {
        type: 'server',
        message: messages.join('. '),
      });
    } catch (error) {
      // Silently ignore if field doesn't exist in form
      // This can happen if backend returns errors for fields not in current step
      console.warn(`Could not set error for field: ${field}`, error);
    }
  });
}
