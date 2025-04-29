export function getYearMonthDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = date.getDay();

  return {
    year,
    month,
    day,
  };
}
