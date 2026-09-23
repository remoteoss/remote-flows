import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';
import {
  CreateContractDocument,
  getV1ContractorsEmploymentsEmploymentIdContractDocumentsId,
  getV1EmploymentsEmploymentIdContractDocuments,
  postV1ContractorsEmploymentsEmploymentIdContractDocuments,
} from '@/src/client';
import { Client } from '@/src/client/client';
import { signatureSchema } from '@/src/common/contract-documents/json-schemas/signature';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { useClient } from '@/src/context';
import { JSFModify } from '@/src/flows/types';
import { clearBase64Data } from '@/src/lib/utils';
import { $TSFixMe } from '@/src/types/remoteFlows';

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

/**
 * One contract document with its PDF, from
 * `GET /v1/contractors/employments/{employment_id}/contract-documents/{id}`.
 */
export const contractDocumentOptions = (
  client: Client,
  employmentId: string,
  contractDocumentId: string,
) =>
  queryOptions({
    queryKey: ['contract-document', employmentId, contractDocumentId] as const,
    retry: false,
    queryFn: async () => {
      const response =
        await getV1ContractorsEmploymentsEmploymentIdContractDocumentsId({
          client,
          path: { employment_id: employmentId, id: contractDocumentId },
        });

      if (response.error || !response.data) {
        throw new Error('Failed to fetch contract document');
      }

      return response;
    },
  });

export const useGetShowContractDocument = ({
  employmentId,
  contractDocumentId,
  options,
}: {
  employmentId: string;
  contractDocumentId: string;
  options?: { queryOptions?: { enabled?: boolean } };
}) => {
  const { client } = useClient();
  return useQuery({
    ...contractDocumentOptions(
      client as Client,
      employmentId,
      contractDocumentId,
    ),
    enabled: options?.queryOptions?.enabled,
    select: ({ data }) => ({
      ...data.data,
      contract_document: {
        ...data.data.contract_document,
        content: clearBase64Data(
          data.data.contract_document.content as $TSFixMe,
        ),
      },
    }),
  });
};

export const useGetContractDocumentSignatureSchema = ({
  fieldValues,
  options,
}: {
  fieldValues: FieldValues;
  options?: { queryOptions?: { enabled?: boolean }; jsfModify?: JSFModify };
}) => {
  return useQuery({
    queryKey: [
      'contract-document-signature',
      fieldValues.review_completed,
      options?.jsfModify,
    ],
    queryFn: async () => {
      return createHeadlessForm(signatureSchema, fieldValues, {
        jsfModify: options?.jsfModify,
      });
    },
    enabled: options?.queryOptions?.enabled,
  });
};

/**
 * Saves the contractor details data
 * @param employmentId - The employment ID
 * @param payload - The payload
 * @returns The contractor contract document
 */
export const useCreateContractorContractDocument = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: async ({
      employmentId,
      payload,
    }: {
      employmentId: string;
      payload: CreateContractDocument;
    }) => {
      return postV1ContractorsEmploymentsEmploymentIdContractDocuments({
        client: client as Client,
        body: payload,
        path: {
          employment_id: employmentId,
        },
      });
    },
  });
};
