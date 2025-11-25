import {
  CreateOffboardingParams,
  postCreateOffboarding,
  Timeoff,
} from '@/src/client';
import {
  useTimeOffLeavePoliciesSummaryQuery,
  useTimeOffQuery,
} from '@/src/common/api';
import { useClient } from '@/src/context';
import { Employment } from '@/src/flows/Onboarding/types';
import { defaultSchema } from '@/src/flows/Termination/json-schemas/defaultSchema';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { JSFModify } from '@/src/flows/types';
import {
  clampNegativeValuesIfApplicable,
  convertTotalHoursToDaysAndHours,
  convertToTotalHours,
  DaysAndHours,
  formatAsDecimal,
} from '@/src/lib/time';
import { Client } from '@/src/client/client';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { schema } from '@/src/flows/Termination/json-schemas/schema';

function formatTimeoffValues(
  values: Record<string, DaysAndHours>,
): Record<string, string> {
  return Object.entries(values).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: formatAsDecimal(value),
    }),
    {},
  );
}

function getMinimumStatutoryDays(employment?: Employment) {
  const availablePto = employment?.contract_details?.available_pto as number;
  const ptoType = employment?.contract_details?.available_pto_type as
    | 'unlimited'
    | 'fixed';
  const countryCode = employment?.country?.code;

  // Special handling for countries without statutory minimums
  if (countryCode === 'USA' && ptoType === 'unlimited') {
    // USA has no minimum, but Remote recommends 20
    return {
      value: availablePto === 0 ? 20 : availablePto,
    };
  }

  // For most countries with unlimited PTO, available_pto IS the statutory minimum
  if (ptoType === 'unlimited' && availablePto > 0) {
    return {
      value: availablePto,
    };
  }

  // For fixed PTO, it's just the entitlement
  return {
    value: availablePto,
  };
}

export type BookedTimeoffBeforeDateResponse = {
  /*
   * The number of days booked before termination.
   */
  bookedDaysBeforeTermination: DaysAndHours;
  /*
   * The number of days booked after termination.
   */
  bookedDaysAfterTermination: DaysAndHours;
};

function getAllTimeoffHoursBeforeDate(
  timeoffs: Timeoff[],
  terminationDate: Date,
): { before: number; after: number } {
  let before = 0;
  let after = 0;

  timeoffs.forEach((timeoff) => {
    timeoff.timeoff_days?.forEach((day) => {
      const dayDate = new Date(day.day);
      if (dayDate <= terminationDate) {
        // Day is on or before termination
        before += day.hours || 0;
      } else {
        // Day is after termination
        after += day.hours || 0;
      }
    });
  });

  return { before, after };
}

/**
 * Hook to retrieve booked time off data before and after a specific date for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch booked time off data for.
 * @param {string} [params.date] - The date to fetch booked time off data for.
 * @returns {BookedTimeoffBeforeDateResponse} - The booked time off data before and after the specific date.
 *
 * This hook accounts for partial days and multiple timeoff_days per request.
 */
export const useBookedTimeoffBeforeAndAfterTerminationQuery = ({
  employmentId,
  date,
  options,
}: {
  employmentId: string;
  date: string;
  options?: { enabled: boolean };
}) => {
  return useTimeOffQuery<BookedTimeoffBeforeDateResponse>({
    employmentId,
    timeoffType: 'paid_time_off',
    status: 'approved',
    options: {
      enabled: options?.enabled,
      select: (data) => {
        const { before, after } = getAllTimeoffHoursBeforeDate(
          data?.data?.timeoffs || [],
          new Date(date),
        );

        return {
          bookedDaysBeforeTermination: convertTotalHoursToDaysAndHours(before),
          bookedDaysAfterTermination: convertTotalHoursToDaysAndHours(after),
        };
      },
    },
  });
};

export type SummaryTimeOffDataResponse = {
  /*
   * The number of days entitled to per year.
   */
  entitledDays: string;
  /*
   * The number of days booked.
   */
  bookedDays: string;
  /*
   * The number of days used.
   */
  usedDays: string;
  /*
   * The number of days current entitlement, better than entitledDays because it takes into account the accrued value.
   */
  currentEntitlementDays: string;
  /*
   * The number of days approved before termination.
   */
  approvedDaysBeforeTermination: string;
  /*
   * The number of days approved after termination.
   */
  approvedDaysAfterTermination: string;
  /*
   * The number of days remaining.
   */
  remainingDays: string;
  /*
   * Whether the PTO is unlimited or not.
   */
  isUnlimitedPto: boolean;
};

/**
 * Hook to retrieve summary time off data for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch summary time off data for.
 * @param {string} [params.proposedTerminationDate] - The proposed termination date to fetch summary time off data for.
 * @returns {SummaryTimeOffDataResponse} - The summary time off data.
 *
 * This hook doesn't take into account unlimited time off or half days yet.
 *
 */
export const useSummaryTimeOffDataQuery = ({
  employmentId,
  proposedTerminationDate,
  employment,
}: {
  employmentId: string;
  proposedTerminationDate: string;
  employment?: Employment;
}) => {
  const { value: minimumStatutoryDays = 0 } =
    getMinimumStatutoryDays(employment);
  const leavePoliciesSummaryQuery = useTimeOffLeavePoliciesSummaryQuery({
    employmentId,
  });
  const bookedTimeQuery = useBookedTimeoffBeforeAndAfterTerminationQuery({
    employmentId,
    date: proposedTerminationDate,
  });

  const entitledDays =
    leavePoliciesSummaryQuery.data?.data?.[0].annual_entitlement.type ===
    'limited'
      ? {
          days: leavePoliciesSummaryQuery.data?.data?.[0].annual_entitlement
            .days,
          hours:
            leavePoliciesSummaryQuery.data?.data?.[0].annual_entitlement.hours,
        }
      : { days: minimumStatutoryDays, hours: 0 };

  const bookedDays = {
    days: leavePoliciesSummaryQuery.data?.data?.[0].booked.days || 0,
    hours: leavePoliciesSummaryQuery.data?.data?.[0].booked.hours || 0,
  };

  const currentEntitlementDays =
    leavePoliciesSummaryQuery.data?.data?.[0].current_entitlement.type ===
    'limited'
      ? {
          days:
            leavePoliciesSummaryQuery.data?.data?.[0].current_entitlement
              .days || 0,
          hours:
            leavePoliciesSummaryQuery.data?.data?.[0].current_entitlement
              .hours || 0,
        }
      : { days: minimumStatutoryDays, hours: 0 };

  const usedDays = {
    days: leavePoliciesSummaryQuery.data?.data?.[0].used.days || 0,
    hours: leavePoliciesSummaryQuery.data?.data?.[0].used.hours || 0,
  };

  const approvedDaysBeforeTermination = bookedTimeQuery.data
    ?.bookedDaysBeforeTermination || { days: 0, hours: 0 };

  const approvedDaysAfterTermination = bookedTimeQuery.data
    ?.bookedDaysAfterTermination || { days: 0, hours: 0 };

  const totalCurrentEntitlementHours = convertToTotalHours(
    currentEntitlementDays.days,
    currentEntitlementDays.hours,
  );
  const totalUsedHours = convertToTotalHours(usedDays.days, usedDays.hours);
  const totalBookedHours = convertToTotalHours(
    bookedDays.days,
    bookedDays.hours,
  );

  const remainingHours =
    totalCurrentEntitlementHours - totalUsedHours - totalBookedHours;

  const remainingDays = clampNegativeValuesIfApplicable(
    convertTotalHoursToDaysAndHours(remainingHours),
  );

  const formattedValues = formatTimeoffValues({
    entitledDays,
    bookedDays,
    usedDays,
    approvedDaysBeforeTermination,
    approvedDaysAfterTermination,
    remainingDays,
    currentEntitlementDays,
  }) as Omit<SummaryTimeOffDataResponse, 'isUnlimitedPto'>;

  return {
    data: {
      ...formattedValues,
      isUnlimitedPto:
        employment?.contract_details?.available_pto_type === 'unlimited',
    },
    isLoading: leavePoliciesSummaryQuery.isLoading || bookedTimeQuery.isLoading,
    isError: leavePoliciesSummaryQuery.isError || bookedTimeQuery.isError,
    error: leavePoliciesSummaryQuery.error || bookedTimeQuery.error,
  };
};

export const useCreateTermination = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (payload: CreateOffboardingParams) => {
      return postCreateOffboarding({
        client: client as Client,
        body: payload,
      });
    },
  });
};

export const useTerminationSchema = ({
  formValues,
  jsfModify,
  step,
}: {
  formValues?: TerminationFormValues;
  jsfModify?: JSFModify;
  step?: string;
}) => {
  return useQuery({
    queryKey: ['rmt-flows-termination-schema', step],
    queryFn: () => {
      return schema[step as keyof typeof schema] ?? defaultSchema;
    },
    select: ({ data }) => {
      let jsfSchema = data?.schema || {};
      if (jsfModify) {
        const { schema } = modify(jsfSchema, jsfModify);
        jsfSchema = schema;
      }
      const form = createHeadlessForm(jsfSchema || {}, {
        initialValues: formValues || {},
      });
      return form;
    },
  });
};
