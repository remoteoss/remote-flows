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
