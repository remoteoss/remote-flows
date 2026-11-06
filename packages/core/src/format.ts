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

/**
 * Ensures base64 data has the correct data URI prefix for PDF content
 * @param base64Data - The base64 data string
 * @returns The base64 data with proper data URI prefix
 */
export const clearBase64Data = (base64Data: string) => {
  if (!base64Data) {
    return '';
  }

  const cleanedData = base64Data.trim();

  if (cleanedData.startsWith('data:application/pdf;base64,')) {
    return cleanedData;
  }

  if (cleanedData.startsWith('data:')) {
    return cleanedData;
  }

  return `data:application/pdf;base64,${cleanedData}`;
};
