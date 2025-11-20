import {
  endOfMonth,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  setDate,
} from 'date-fns';
import { PayrollCalendarEor } from '@/src/client';
import { Step } from '@/src/flows/useStepState';
import { PAYROLL_CYCLES } from '@/src/common/payroll';

export type StepTerminationKeys =
  | 'employee_communication'
  | 'termination_details'
  | 'paid_time_off'
  | 'additional_information';

export const STEPS: Record<StepTerminationKeys, Step<StepTerminationKeys>> = {
  employee_communication: { index: 0, name: 'employee_communication' },
  termination_details: { index: 1, name: 'termination_details' },
  paid_time_off: { index: 2, name: 'paid_time_off' },
  additional_information: { index: 3, name: 'additional_information' },
} as const;

export const calculateMinTerminationDate = (
  payrollCalendars: PayrollCalendarEor | undefined,
) => {
  const today = new Date();
  const midMonthDate = setDate(today, 15);

  // Normalize today and mid month date to midnight to ensure consistent date comparisons regardless of time
  const normalizedToday = startOfDay(today);
  const normalizedMidMonthDate = startOfDay(midMonthDate);

  const payFrequency = payrollCalendars?.cycle_frequency;

  const currentMonthCutoffDates = payrollCalendars?.cycles
    ?.filter(
      (cycle) =>
        cycle.input_cutoff_date &&
        parseISO(cycle.input_cutoff_date).getMonth() === today.getMonth(),
    )
    // Since cutoffDate is a date-only string with no time component, the converted Date will be set to midnight
    ?.map((cycle) => parseISO(cycle.input_cutoff_date!));

  if (!currentMonthCutoffDates?.length) return today;

  switch (payFrequency) {
    /**
     * For monthly payroll, if today is
     * - after cutoff return end of month
     * - any other case return today
     */
    case PAYROLL_CYCLES.MONTHLY:
      return isAfter(normalizedToday, currentMonthCutoffDates[0])
        ? endOfMonth(today)
        : today;

    /**
     * For bi-monthly payroll, if today is
     * - after second cutoff return end of month
     * - between first cutoff and mid-month return mid-month date
     * - any other case return today
     */
    case PAYROLL_CYCLES.SEMI_MONTHLY:
      if (isAfter(normalizedToday, currentMonthCutoffDates[1]))
        return endOfMonth(today);
      if (
        isAfter(normalizedToday, currentMonthCutoffDates[0]) &&
        isBefore(normalizedToday, normalizedMidMonthDate)
      )
        return midMonthDate;
      return today;

    default:
      return today;
  }
};
