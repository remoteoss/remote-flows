import {
  CreateContractDocument,
  getShowContractDocument,
  getShowContractorContractDetailsCountry,
  getIndexSubscription,
  ManageContractorPlusSubscriptionOperationsParams,
  postCreateContractDocument,
  postManageContractorPlusSubscriptionSubscription,
  postSignContractDocument,
  SignContractDocument,
} from '@/src/client';
import { useClient } from '@/src/context';
import { signatureSchema } from '@/src/flows/ContractorOnboarding/json-schemas/signature';
import { selectContractorSubscriptionStepSchema } from '@/src/flows/ContractorOnboarding/json-schemas/selectContractorSubscriptionStep';
import {
  JSONSchemaFormResultWithFieldsets,
  FlowOptions,
} from '@/src/flows/types';
import { formatCurrency } from '@/src/lib/utils';
import { Client } from '@/src/client/client';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';
import { corProductIdentifier } from '@/src/flows/ContractorOnboarding/constants';
import { $TSFixMe, JSFField } from '@/src/types/remoteFlows';

/**
 * Get the contract document signature schema
 * @param fieldValues - The field values
 * @param options - The options
 * @returns The contract document signature schema
 */
export const useGetContractDocumentSignatureSchema = ({
  fieldValues,
  options,
}: {
  fieldValues: FieldValues;
  options?: { queryOptions?: { enabled?: boolean } };
}) => {
  return useQuery({
    queryKey: ['contract-document-signature'],
    queryFn: async () => {
      return createHeadlessForm(signatureSchema, fieldValues);
    },
    enabled: options?.queryOptions?.enabled,
  });
};

/**
 * Signs the contract document
 * @param employmentId - The employment ID
 * @param contractDocumentId - The contract document ID
 * @param payload - The payload
 * @returns The signed contract document
 */
export const useSignContractDocument = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: async ({
      employmentId,
      contractDocumentId,
      payload,
    }: {
      employmentId: string;
      contractDocumentId: string;
      payload: SignContractDocument;
    }) => {
      return postSignContractDocument({
        client: client as Client,
        body: payload,
        path: {
          employment_id: employmentId,
          contract_document_id: contractDocumentId,
        },
      });
    },
  });
};

/**
 * Get the contract document for a given employment and contract document ID
 * @param employmentId - The employment ID
 * @param contractDocumentId - The contract document ID
 * @returns The contract document
 */
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
    queryKey: ['contract-document', employmentId, contractDocumentId],
    queryFn: async () => {
      return getShowContractDocument({
        client: client as Client,
        path: { employment_id: employmentId, id: contractDocumentId },
      });
    },
    enabled: options?.queryOptions?.enabled,
    select: ({ data }) => {
      return data?.data;
    },
  });
};

/**
 * Get the contractor subscriptions for the given employment id
 * @param employmentId - The employment ID
 * @returns The contractor subscriptions available
 */
export const useGetContractorSubscriptions = ({
  employmentId,
  options,
}: {
  employmentId: string;
  options?: { queryOptions?: { enabled?: boolean } };
}) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['contractor-subscriptions', employmentId],
    queryFn: async () => {
      return getIndexSubscription({
        client: client as Client,
        path: { employment_id: employmentId },
      });
    },
    enabled: options?.queryOptions?.enabled,
    select: ({ data }) => {
      return data?.data;
    },
  });
};

/**
 * Upgrade or downgrade contractor subscription
 */
export const usePostManageContractorSubscriptions = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: async ({
      employmentId,
      payload,
    }: {
      employmentId: string;
      payload: ManageContractorPlusSubscriptionOperationsParams;
    }) => {
      return postManageContractorPlusSubscriptionSubscription({
        client: client as Client,
        body: payload,
        path: {
          employment_id: employmentId,
        },
      });
    },
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
      return postCreateContractDocument({
        client: client as Client,
        body: payload,
        path: {
          employment_id: employmentId,
        },
      });
    },
  });
};

/**
 * Get the contractor onboarding details schema for a given country
 * @param countryCode - The country code
 * @param fieldValues - The field values
 * @param options - The options
 * @returns The contractor onboarding details schema
 */
export const useContractorOnboardingDetailsSchema = ({
  countryCode,
  fieldValues,
  options,
}: {
  countryCode: string;
  fieldValues: FieldValues;
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } };
  query?: Record<string, unknown>;
}): UseQueryResult<JSONSchemaFormResultWithFieldsets> => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['contractor-onboarding-details-schema', countryCode],
    retry: false,
    queryFn: async () => {
      return getShowContractorContractDetailsCountry({
        client: client as Client,
        path: { country_code: countryCode },
        query: {
          json_schema_version: 1,
        },
      });
    },
    enabled: options?.queryOptions?.enabled,
    select: ({ data }) => {
      const jsfSchema = data?.data?.schema || {};
      return createHeadlessForm(jsfSchema, fieldValues, options);
    },
  });
};

// TODO: remove later when endpoint is deployed
const CONTRACT_PRODUCT_TITLES = {
  ['urn:remotecom:resource:product:contractor:plus:monthly']:
    'Contractor Management Plus',
  ['urn:remotecom:resource:product:contractor:standard:monthly']:
    'Contractor Management',
};

export const useContractorSubscriptionSchemaField = (
  employmentId: string,
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } },
) => {
  const { data: contractorSubscriptions, isLoading: isLoading } =
    useGetContractorSubscriptions({
      employmentId: employmentId,
      options: {
        queryOptions: options?.queryOptions,
      },
    });

  const form = createHeadlessForm(
    selectContractorSubscriptionStepSchema.data.schema,
    {},
    options,
  );

  if (contractorSubscriptions) {
    const field: JSFField | undefined = form.fields.find(
      (field) => field.name === 'subscription',
    ) as JSFField | undefined;
    if (field) {
      const options = contractorSubscriptions
        .filter((opts) => opts.product.identifier !== corProductIdentifier)
        .map((opts) => {
          let formattedPrice = '';
          if (opts.price.amount) {
            formattedPrice = formatCurrency(
              opts.price.amount,
              opts.currency.symbol,
            );
          }
          const foundOption = field?.options?.find(
            (option: { value: string }) =>
              option.value === opts.product.identifier,
          );
          const product: $TSFixMe = opts.product; // TODO: fix types later
          const title =
            CONTRACT_PRODUCT_TITLES[
              product.identifier as keyof typeof CONTRACT_PRODUCT_TITLES
            ] ??
            foundOption?.label ??
            ''; // TODO: remove later foundOption?.title;
          const label = title; // TODO: remove later foundOption?.label;
          const value = product.identifier ?? '';
          const description =
            product.description ?? foundOption?.description ?? ''; // TODO: remove later foundOption?.description
          const features =
            product.features ?? foundOption?.meta?.features ?? []; // TODO: remove later foundOption?.meta?.features
          const meta = {
            ...foundOption?.meta,
            features,
            price: formattedPrice,
          };
          return { label, value, description, meta };
        });
      field.options = options.sort((a, b) => a.label.localeCompare(b.label));
    }
  }

  return {
    isLoading,
    form,
  };
};
