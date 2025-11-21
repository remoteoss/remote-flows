import { isFuture, isToday, parseISO } from 'date-fns';

export const isInProbationPeriod = (probationEndDate: string | undefined) => {
  if (!probationEndDate) return false;

  const parsedProbationEndDate = parseISO(probationEndDate);

  return isFuture(parsedProbationEndDate) || isToday(parsedProbationEndDate);
};
