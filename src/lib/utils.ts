import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
