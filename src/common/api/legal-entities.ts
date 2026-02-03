import { useQuery } from '@tanstack/react-query';
import { getIndexCompanyLegalEntities } from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';

/**
 * Hook to get the legal entities for a company
 * @param companyId - The company ID
 * @returns The legal entities
 */
export const useLegalEntities = (companyId: string) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['legal-entities'],
    queryFn: () =>
      getIndexCompanyLegalEntities({
        client: client as Client,
        path: {
          company_id: companyId,
        },
      }),
    select: (data) => data.data?.data?.legal_entities,
    enabled: !!companyId,
  });
};

export const useDefaultLegalEntity = (companyId: string) => {
  const { data: legalEntities } = useLegalEntities(companyId);
  return legalEntities?.find((legalEntity) => legalEntity.is_default);
};
