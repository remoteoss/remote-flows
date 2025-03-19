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

function round(value: number): number {
  return Number(value.toFixed(2));
}

function convertToValidCost(value: string) {
  return parseFloat(value.replace(/,/g, ''));
}

/**
 * Converts a string amount to cents.
 *
 * This function takes a string representing a monetary amount, converts it to a valid number,
 * and then multiplies it by 100 to get the value in cents. The result is rounded to two decimal places.
 *
 * @param {string} amount - The string representation of the monetary amount.
 * @returns {number} - The amount in cents, rounded to two decimal places.
 */
export function convertToCents(amount: string): number {
  const validAmount = convertToValidCost(amount);

  return round(validAmount * 100);
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
