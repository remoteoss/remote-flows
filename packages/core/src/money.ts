export function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function convertToValidCost(value: string) {
  return parseFloat(value.replace(/,/g, ''));
}

export function convertToCents(
  amount?: number | string | string[] | null | boolean,
) {
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
  if (amount == null || Number.isNaN(amount)) {
    return null;
  }

  let normalizedValue: number;

  if (typeof amount === 'string') {
    normalizedValue = convertToValidCost(amount || '0');
  } else {
    normalizedValue = amount;
  }

  return round(normalizedValue / 100);
}
