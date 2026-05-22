export function getYearMonthDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return {
    year,
    month,
    day,
  };
}

/**
 * Parses a date-only string (YYYY-MM-DD) as local time, avoiding timezone issues.
 *
 * Using `new Date('2025-01-15')` parses as UTC midnight, which becomes the previous
 * day in UTC-negative timezones (Americas). This function parses the date components
 * directly to create a Date at local midnight, ensuring the same calendar day
 * regardless of timezone.
 *
 * Use this for date-only strings from forms, API responses, or anywhere you need
 * calendar dates without time/timezone considerations.
 *
 * @example
 * // In New York (UTC-5):
 * new Date('2025-01-15')      // → 2025-01-14T19:00:00 (previous day!)
 * parseLocalDate('2025-01-15') // → 2025-01-15T00:00:00 (correct day)
 */
export const parseLocalDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Formats current UTC date/time as ISO string for terms of service acceptance
 * @returns Formatted UTC datetime string (YYYY-MM-DD HH:mm:ssZ)
 */
export function nowUtcFormatted(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ` +
    `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}Z`
  );
}
