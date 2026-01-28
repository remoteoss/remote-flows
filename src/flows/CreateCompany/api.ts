import { useMutation } from '@tanstack/react-query';
import { useClient } from '@/src/context';
import { Client } from '@/src/client/client';

import {
  CreateCompanyParams,
  postCreateCompany,
  patchUpdateCompany2,
  UpdateCompanyParams,
} from '@/src/client';

/**
 * Hook to create a company
 * @returns Mutation hook for creating a company
 */
export const useCreateCompanyRequest = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (payload: CreateCompanyParams) => {
      return postCreateCompany({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
      });
    },
  });
};

/**
 * Hook to update a company
 * @returns Mutation hook for updating a company
 */
export const useUpdateCompanyRequest = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: ({
      companyId,
      payload,
      jsonSchemaVersion,
    }: {
      companyId: string;
      payload: UpdateCompanyParams;
      jsonSchemaVersion?: number | 'latest';
    }) => {
      return patchUpdateCompany2({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          company_id: companyId,
        },
        body: payload,
        query: {
          address_details_json_schema_version: jsonSchemaVersion,
        },
      });
    },
  });
};
