import { useQuery, queryOptions } from '@tanstack/react-query';
import { getV1Employments, MinimalEmployment } from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';

/**
 * Pages to walk when loading contractors for the picker. `GET /v1/employments` is paginated
 * and, as of writing, exposes no name/search parameter — so the picker loads pages up front
 * and filters in the browser.
 *
 * When a `name` query parameter lands on the endpoint, drop the walk and pass the search term
 * through instead: `contractorsOptions` is the only place that needs to change.
 */
const MAX_PAGES = 10;
const PAGE_SIZE = 100;

export type Contractor = {
  id: string;
  fullName: string;
};

export type ContractorsResult = {
  contractors: Contractor[];
  /**
   * Total contractors the API reports. Larger than `contractors.length` when the walk hit
   * `MAX_PAGES`, in which case the picker is showing a subset.
   */
  totalCount: number;
  /**
   * True when the walk stopped early, so the list is incomplete.
   */
  isTruncated: boolean;
};

const toContractor = (employment: MinimalEmployment): Contractor => ({
  id: employment.id,
  fullName: employment.full_name,
});

/**
 * Query options factory for the active contractors of the authenticated company.
 */
export const contractorsOptions = (client: Client) =>
  queryOptions({
    queryKey: ['invoice-schedule-contractors'] as const,
    queryFn: async (): Promise<ContractorsResult> => {
      const collected: MinimalEmployment[] = [];
      let page = 1;
      let totalPages = 1;
      let totalCount = 0;

      while (page <= Math.min(totalPages, MAX_PAGES)) {
        const response = await getV1Employments({
          client,
          // The client supplies the real credentials; the generated type only requires the key.
          headers: { Authorization: `` },
          query: {
            employment_type: 'contractor',
            status: 'active',
            page,
            page_size: PAGE_SIZE,
          },
        });

        if (response.error || !response.data) {
          throw new Error('Failed to fetch contractors');
        }

        const data = response.data.data;
        collected.push(...(data?.employments ?? []));
        totalPages = data?.total_pages ?? 1;
        totalCount = data?.total_count ?? collected.length;
        page += 1;
      }

      return {
        contractors: collected.map(toContractor),
        totalCount,
        isTruncated: collected.length < totalCount,
      };
    },
  });

/**
 * Active contractors for the invoice-schedule contractor picker.
 */
export const useContractors = (options?: {
  queryOptions?: { enabled?: boolean };
}) => {
  const { client } = useClient();
  return useQuery({
    ...contractorsOptions(client as Client),
    enabled: options?.queryOptions?.enabled ?? true,
  });
};
