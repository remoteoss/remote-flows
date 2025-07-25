import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ValidationError } from 'yup';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | undefined,
  symbol = '€',
): string {
  if (!amount) {
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
