import { isFuture, isToday, parseISO } from 'date-fns';

export const isInProbationPeriod = (
  probationEndDate: string | Date | undefined,
) => {
  if (!probationEndDate) return false;

  const parsedProbationEndDate =
    typeof probationEndDate === 'string'
      ? parseISO(probationEndDate)
      : probationEndDate;

  return isFuture(parsedProbationEndDate) || isToday(parsedProbationEndDate);
};
