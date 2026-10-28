import { queryOptions, useQuery } from '@tanstack/react-query';
import { getV1TimeoffId, TimeoffResponse } from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
import { TimeOffRequestError } from '@/src/flows/TimeOff/types';

const getTimeOffRequestErrorReason = (
  status: number | undefined,
): TimeOffRequestError['reason'] => {
  if (status === 404) {
    return 'not_found';
  }
  if (status === 401 || status === 403) {
    return 'unauthorized';
  }
  return 'request_failed';
};

/**
 * One time-off request, from `GET /v1/timeoff/{id}`.
 */
export const timeOffRequestOptions = (client: Client, timeOffId: string) =>
  queryOptions<TimeoffResponse, TimeOffRequestError>({
    queryKey: ['timeoff-request', timeOffId] as const,
    retry: false,
    queryFn: async () => {
      const response = await getV1TimeoffId({
        client,
        headers: {
          Authorization: ``,
        },
        path: { id: timeOffId },
      });

      if (response.error || !response.data) {
        const status = response.response?.status;
        throw {
          reason: getTimeOffRequestErrorReason(status),
          status,
        } satisfies TimeOffRequestError;
      }

      return response.data;
    },
  });

export const useGetTimeOffRequest = (timeOffId: string | undefined) => {
  const { client } = useClient();
  return useQuery({
    ...timeOffRequestOptions(client as Client, timeOffId ?? ''),
    enabled: Boolean(timeOffId),
    select: (data) => data.data.timeoff,
  });
};
