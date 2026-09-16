import { queryOptions, useQuery } from '@tanstack/react-query';
import { getV1EmploymentsEmploymentIdContractDocuments } from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';

/**
 * The contract documents of an employment, from
 * `GET /v1/employments/{employment_id}/contract-documents`.
 */
export const contractDocumentsOptions = (
  client: Client,
  employmentId: string,
) =>
  queryOptions({
    queryKey: ['contract-documents', employmentId] as const,
    retry: false,
    queryFn: async () => {
      const response = await getV1EmploymentsEmploymentIdContractDocuments({
        client,
        path: { employment_id: employmentId },
      });

      if (response.error || !response.data) {
        throw new Error('Failed to fetch contract documents');
      }

      return response;
    },
  });

export const useGetContractDocuments = (
  employmentId: string,
  options?: { enabled?: boolean },
) => {
  const { client } = useClient();
  return useQuery({
    ...contractDocumentsOptions(client as Client, employmentId),
    enabled: options?.enabled,
    select: ({ data }) => data?.data?.contract_documents,
  });
};
