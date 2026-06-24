import {
  getV1EmploymentsEmploymentId,
  GetV1EmploymentsEmploymentIdResponse,
  getV2EmploymentsEmploymentIdBasicInformation,
  GetV2EmploymentsEmploymentIdBasicInformationResponse,
  postV1CancelOnboardingEmploymentId,
} from '@/src/client';
import { useClient } from '@/src/context';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
import { Client } from '@/src/client/client';

/**
 * Hook to retrieve employment details for a specific employment ID.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} params.employmentId - The ID of the employment to fetch details for.
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the employment details.
 */
export const useEmploymentQuery = ({
  employmentId,
  queryParams,
}: {
  employmentId: string;
  queryParams?: $TSFixMe; // TODO: we need to generate openapi-ts types but it's broken at the moment
}): UseQueryResult<
  GetV1EmploymentsEmploymentIdResponse['data']['employment'],
  unknown
> => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['employment', employmentId],
    retry: false,
    queryFn: () => {
      return getV1EmploymentsEmploymentId({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { employment_id: employmentId },
        query: queryParams,
      });
    },
    enabled: !!employmentId,
    select: ({ data }) => data?.data?.employment,
  });
};

type EmploymentBasicInformationV2 = NonNullable<
  GetV2EmploymentsEmploymentIdBasicInformationResponse['data']['employment']
>;

/**
 * Hook to retrieve an employment's basic information from the v2 endpoint.
 *
 * The v1 employment endpoint (see {@link useEmploymentQuery}) does not return
 * `contract_origin`; only `GET /v2/employments/{id}/basic_information` does.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} params.employmentId - The ID of the employment to fetch basic information for.
 * @param {Object} [params.options] - Query options.
 * @param {boolean} [params.options.enabled] - Whether the query is enabled.
 * @returns The query result, selected down to the employment basic information payload.
 */
export const useEmploymentBasicInformationV2 = ({
  employmentId,
  options,
}: {
  employmentId: string;
  options?: { enabled?: boolean };
}): UseQueryResult<EmploymentBasicInformationV2, unknown> => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['employment-basic-information-v2', employmentId],
    retry: false,
    queryFn: () => {
      return getV2EmploymentsEmploymentIdBasicInformation({
        client: client as Client,
        path: { employment_id: employmentId },
      });
    },
    enabled: (options?.enabled ?? true) && !!employmentId,
    select: ({ data }) =>
      data?.data?.employment as EmploymentBasicInformationV2,
  });
};

/**
 * Hook to discard an employment.
 *
 * @returns {UseMutationResult<void, unknown, { employmentId: string }, unknown>} - The mutation result.
 */
export const useDiscardEmploymentMutation = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: ({ employmentId }: { employmentId: string }) => {
      return postV1CancelOnboardingEmploymentId({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { employment_id: employmentId },
      });
    },
  });
};
