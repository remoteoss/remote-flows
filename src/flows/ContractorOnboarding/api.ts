import {
  CreateContractDocument,
  getShowContractDocument,
  getShowContractorContractDetailsCountry,
  postCreateContractDocument,
  postSignContractDocument,
  SignContractDocument,
} from '@/src/client';
import { convertToCents } from '@/src/components/form/utils';
import { useClient } from '@/src/context';
import { signatureSchema } from '@/src/flows/ContractorOnboarding/json-schemas/signature';
import { FlowOptions } from '@/src/flows/types';
import { findFieldsByType } from '@/src/flows/utils';
import { JSFFieldset } from '@/src/types/remoteFlows';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';

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
      return createHeadlessForm(signatureSchema, {
        initialValues: fieldValues,
      });
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
}) => {
  const jsonSchemaQueryParam = options?.jsonSchemaVersion
    ?.contractor_contract_details_form_schema
    ? {
        json_schema_version:
          options.jsonSchemaVersion.contractor_contract_details_form_schema,
      }
    : {};
  const { client } = useClient();
  return useQuery({
    queryKey: ['contractor-onboarding-details-schema', countryCode],
    retry: false,
    queryFn: async () => {
      return getShowContractorContractDetailsCountry({
        client: client as Client,
        path: { country_code: countryCode },
        query: {
          ...jsonSchemaQueryParam,
        },
      });
    },
    enabled: options?.queryOptions?.enabled,
    select: ({ data }) => {
      let jsfSchema = data?.data?.schema || {};
      if (options && options.jsfModify) {
        const { schema } = modify(jsfSchema, options.jsfModify);
        jsfSchema = schema;
      }

      // Contract details contains x-jsf-logic that need to be calculated every time a form value changes
      // In particular there are calculations involving the annual_gross_salary field. However this field value doesn't get
      // here in cents. So we need to convert the money fields to cents, so that the calculations are correct.
      const moneyFields = findFieldsByType(jsfSchema.properties || {}, 'money');
      const moneyFieldsData = moneyFields.reduce<Record<string, number | null>>(
        (acc, field) => {
          acc[field] = convertToCents(fieldValues[field]);
          return acc;
        },
        {},
      );

      const initialValues = {
        ...fieldValues,
        ...moneyFieldsData,
      };

      return {
        meta: {
          'x-jsf-fieldsets': jsfSchema['x-jsf-fieldsets'] as JSFFieldset,
        },
        ...createHeadlessForm(jsfSchema, {
          initialValues,
        }),
      };
    },
  });
};
