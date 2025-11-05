import {
  getIndexLeavePoliciesSummary,
  getIndexTimeoff,
  getShowEmployment,
  ListTimeoffResponse,
  Timeoff,
  TimeoffStatus,
  TimeoffType,
} from '@/src/client';
import { useClient } from '@/src/context';
import { ContractAmendmentParams } from '@/src/flows/ContractAmendment/types';
import {
  convertTotalHoursToDaysAndHours,
  convertToTotalHours,
  DaysAndHours,
  formatAsDecimal,
} from '@/src/lib/time';
import { Client } from '@hey-api/client-fetch';
import { useQuery } from '@tanstack/react-query';

type UseEmployment = Pick<ContractAmendmentParams, 'employmentId'>;

/**
 * Hook to retrieve employment details for a specific employment ID.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} params.employmentId - The ID of the employment to fetch details for.
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the employment details.
 */
export const useEmploymentQuery = ({ employmentId }: UseEmployment) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['employment', employmentId],
    retry: false,
    queryFn: () => {
      return getShowEmployment({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { employment_id: employmentId },
      });
    },
    select: ({ data }) => data,
  });
};

/**
 * Hook to retrieve time off data for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch time off data for.
 * @param {TimeoffStatus} [params.status] - The status of the time off requests to filter by (e.g., 'approved', 'pending').
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the time off data.
 *
 */
export const useTimeOffQuery = <TData = ListTimeoffResponse>({
  employmentId,
  status,
  timeoffType,
  options,
}: {
  employmentId?: string;
  status?: TimeoffStatus;
  timeoffType?: TimeoffType;
  options?: {
    enabled?: boolean;
    select?: (data: ListTimeoffResponse | undefined) => TData;
  };
}) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['timeoff', employmentId, status],
    retry: false,
    queryFn: () => {
      return getIndexTimeoff({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        query: {
          employment_id: employmentId,
          status: status,
          timeoff_type: timeoffType,
        },
      });
    },
    select: ({ data }) => (options?.select?.(data) ?? data) as TData,
    enabled: options?.enabled,
  });
};

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const end = new Date(endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return `${start} → ${end}`;
};

export type PaidTimeoffBreakdownResponse = {
  bookedDays: number;
  timeoffs: {
    status: string;
    duration: number;
    startDate: string;
    endDate: string;
    formattedDate: string;
  }[];
};

/**
 * Hook to retrieve paid time off breakdown for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch paid time off breakdown for.
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the paid time off breakdown.
 *
 */
export const usePaidTimeoffBreakdownQuery = ({
  employmentId,
  options,
}: {
  employmentId?: string;
  options?: {
    enabled?: boolean;
  };
}) => {
  return useTimeOffQuery<PaidTimeoffBreakdownResponse>({
    employmentId,
    timeoffType: 'paid_time_off',
    options: {
      enabled: options?.enabled,
      select: (data) => {
        return {
          bookedDays: data?.data?.total_count || 0,
          timeoffs:
            data?.data?.timeoffs?.map((timeoff) => {
              return {
                status: timeoff?.status,
                duration: timeoff?.timeoff_days.length,
                startDate: timeoff?.start_date,
                endDate: timeoff?.end_date,
                formattedDate: formatDateRange(
                  timeoff?.start_date,
                  timeoff?.end_date,
                ),
              };
            }) || [],
        };
      },
    },
  });
};

export type BookedTimeoffBeforeDateResponse = {
  bookedDaysBeforeTermination: DaysAndHours;
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

export type SummaryTimeOffDataResponse = {
  entitledDays: string;
  bookedDays: string;
  usedDays: string;
  approvedDaysBeforeTermination: string;
  approvedDaysAfterTermination: string;
  remainingDays: string;
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
}: {
  employmentId: string;
  proposedTerminationDate: string;
}) => {
  const leavePoliciesSummaryQuery = useTimeOffLeavePoliciesSummaryQuery({
    employmentId,
  });
  const bookedTimeQuery = useBookedTimeoffBeforeAndAfterTerminationQuery({
    employmentId,
    date: proposedTerminationDate,
  });

  // the entitled Days when it's unlimited we're assigning 0 days and hours, we need to handle this case
  // with data from the BE which we don't have yet.
  const entitledDays =
    leavePoliciesSummaryQuery.data?.data?.[0].annual_entitlement.type ===
    'limited'
      ? {
          days: leavePoliciesSummaryQuery.data?.data?.[0].annual_entitlement
            .days,
          hours:
            leavePoliciesSummaryQuery.data?.data?.[0].annual_entitlement.hours,
        }
      : { days: 0, hours: 0 };

  const bookedDays = {
    days: leavePoliciesSummaryQuery.data?.data?.[0].booked.days || 0,
    hours: leavePoliciesSummaryQuery.data?.data?.[0].booked.hours || 0,
  };

  const usedDays = {
    days: leavePoliciesSummaryQuery.data?.data?.[0].used.days || 0,
    hours: leavePoliciesSummaryQuery.data?.data?.[0].used.hours || 0,
  };

  const approvedDaysBeforeTermination = bookedTimeQuery.data
    ?.bookedDaysBeforeTermination || { days: 0, hours: 0 };

  const approvedDaysAfterTermination = bookedTimeQuery.data
    ?.bookedDaysAfterTermination || { days: 0, hours: 0 };

  const remainingTotalHours =
    convertToTotalHours(entitledDays.days, entitledDays.hours) -
    convertToTotalHours(bookedDays.days, bookedDays.hours) -
    convertToTotalHours(usedDays.days, usedDays.hours);

  const remainingDays =
    remainingTotalHours < 0
      ? { days: 0, hours: 0 }
      : convertTotalHoursToDaysAndHours(remainingTotalHours);

  const formattedValues = formatTimeoffValues({
    entitledDays,
    bookedDays,
    usedDays,
    approvedDaysBeforeTermination,
    approvedDaysAfterTermination,
    remainingDays,
  });

  return {
    data: formattedValues,
    isLoading: leavePoliciesSummaryQuery.isLoading || bookedTimeQuery.isLoading,
    isError: leavePoliciesSummaryQuery.isError || bookedTimeQuery.isError,
    error: leavePoliciesSummaryQuery.error || bookedTimeQuery.error,
  };
};

/**
 * Hook to retrieve time off balance for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch time off balance for.
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the time off balance.
 *
 */
export const useTimeOffLeavePoliciesSummaryQuery = ({
  employmentId,
}: {
  employmentId?: string;
}) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['timeoff-balance', employmentId],
    retry: false,
    queryFn: () => {
      return getIndexLeavePoliciesSummary({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { employment_id: employmentId as string },
      });
    },
    select: ({ data }) => data,
  });
};
