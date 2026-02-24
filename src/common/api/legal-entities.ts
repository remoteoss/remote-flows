import { useQuery } from '@tanstack/react-query';
import { getIndexCompanyLegalEntities } from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
import { useIdentity } from '@/src/common/api/identity';
import { hasCompany } from '@/src/common/api/companies';

/**
 * Hook to get the legal entities for a company
 * @param companyId - The company ID
 * @returns The legal entities
 */
export const useLegalEntities = () => {
  const { client } = useClient();
  const { data: identity } = useIdentity();
  const companyId = hasCompany(identity) ? (identity?.company?.id ?? '') : '';

  return useQuery({
    queryKey: ['legal-entities', companyId],
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

export const useDefaultLegalEntity = () => {
  const { data: legalEntities } = useLegalEntities();
  return legalEntities?.find((legalEntity) => legalEntity.is_default);
};
