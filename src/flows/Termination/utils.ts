import {
  endOfMonth,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  setDate,
<<<<<<< HEAD
  isFuture,
  differenceInHours,
  endOfDay,
  differenceInDays,
=======
>>>>>>> main
} from 'date-fns';
import { PayrollCalendarEor } from '@/src/client';
import { Step } from '@/src/flows/useStepState';
import { PAYROLL_CYCLES } from '@/src/common/payroll';
<<<<<<< HEAD
import { createStatementProperty } from '@/src/components/form/jsf-utils/createFields';
import { formatMonthDayInLocalTime } from '@/src/lib/time';
import { TerminationFormValues } from '@/src/flows/Termination/types';
=======
>>>>>>> main

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
<<<<<<< HEAD

export const calculateProposedTerminationDateStatement = ({
  minTerminationDate,
  isEmployeeInProbationPeriod,
  selectedDate,
}: {
  minTerminationDate: Date;
  isEmployeeInProbationPeriod: boolean;
  selectedDate?: Date;
}) => {
  const hasPassedCutoffDate = isFuture(minTerminationDate);
  const isShortNotice =
    selectedDate && differenceInHours(endOfDay(selectedDate), new Date()) < 48;
  const isMoreThan30Days =
    selectedDate && differenceInDays(selectedDate, new Date()) >= 30;

  if (isMoreThan30Days || (!selectedDate && !hasPassedCutoffDate)) {
    return null;
  }

  if (hasPassedCutoffDate && !isEmployeeInProbationPeriod) {
    return createStatementProperty({
      description: `The next available termination dates are ${formatMonthDayInLocalTime(minTerminationDate)} and later. We've already processed the employee's payments until then.`,
      severity: 'info',
    });
  }

  if (hasPassedCutoffDate && isEmployeeInProbationPeriod) {
    return createStatementProperty({
      description: `This payroll period's cut-off has passed. While you can offboard the employee after the cut-off, their payment may have already processed. If that's the case, we'll try to recover the payment. But if that isn't possible, we'll send you an invoice for the amount.`,
      severity: 'info',
    });
  }

  if (isShortNotice) {
    return createStatementProperty({
      description: `Requests made with less than 48 hours' notice are subject to changes due to the country-specific offboarding laws and case details. If changes are needed, your specialist will guide you accordingly.`,
      severity: 'info',
    });
  }

  return createStatementProperty({
    description: `Termination dates depend on payroll cutoffs, local laws, and case details. We'll aim for your proposed date but it's possible it will need to change. After you submit your request, a specialist will reach out and guide you through the process.`,
    severity: 'info',
  });
};

export function buildInitialValues(
  stepsInitialValues: Partial<TerminationFormValues>,
  hasFutureStartDate: boolean,
): TerminationFormValues {
  const initialValues: TerminationFormValues = {
    confidential: '',
    customer_informed_employee: '',
    customer_informed_employee_date: '',
    customer_informed_employee_description: '',
    personal_email: '',
    termination_reason: undefined,
    reason_description: '',
    termination_reason_files: [],
    will_challenge_termination: '',
    will_challenge_termination_description: null,
    agrees_to_pto_amount: '',
    agrees_to_pto_amount_notes: null,
    acknowledge_termination_procedure: false,
    additional_comments: '',
    proposed_termination_date: '',
    risk_assessment_reasons: [],
    timesheet_file: undefined,
    ...stepsInitialValues,
    ...(hasFutureStartDate
      ? { termination_reason: 'cancellation_before_start_date' }
      : {}),
  };

  return initialValues;
}
=======
>>>>>>> main
