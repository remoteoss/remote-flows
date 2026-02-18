import { FormResult } from '@remoteoss/remote-json-schema-form-kit';
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
  getIndexEmploymentContractDocument,
  EligibilityQuestionnaireJsonSchemaResponse,
  getShowEligibilityQuestionnaire,
  SubmitEligibilityQuestionnaireRequest,
  postCreateEligibilityQuestionnaire,
  postManageContractorCorSubscriptionSubscription,
  deleteDeleteContractorCorSubscriptionSubscription,
} from '@/src/client';
import { useClient } from '@/src/context';
import { signatureSchema } from '@/src/flows/ContractorOnboarding/json-schemas/signature';
import { selectContractorSubscriptionStepSchema } from '@/src/flows/ContractorOnboarding/json-schemas/selectContractorSubscriptionStep';
import {
  JSONSchemaFormResultWithFieldsets,
  FlowOptions,
  JSFModify,
} from '@/src/flows/types';
import { clearBase64Data } from '@/src/lib/utils';
import { Client } from '@/src/client/client';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';
import {
  contractorPlusProductIdentifier,
  contractorStandardProductIdentifier,
  corProductIdentifier,
  IR35_FILE_SUBTYPE,
} from '@/src/flows/ContractorOnboarding/constants';
import { $TSFixMe, JSFField } from '@/src/types/remoteFlows';
import { mutationToPromise } from '@/src/lib/mutations';
import {
  useDownloadFile,
  useEmploymentFiles,
  useUploadFile,
} from '@/src/common/api/files';
import { convertFromCents } from '@/src/components/form/utils';

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
  options?: { queryOptions?: { enabled?: boolean }; jsfModify?: JSFModify };
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
      return {
        ...data?.data,
        contract_document: {
          ...data?.data?.contract_document,
          content: clearBase64Data(
            data?.data?.contract_document?.content as $TSFixMe,
          ),
        },
      };
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
  employmentId,
  fieldValues,
  options,
}: {
  countryCode: string;
  fieldValues: FieldValues;
  employmentId: string;
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } };
  query?: Record<string, unknown>;
}): UseQueryResult<JSONSchemaFormResultWithFieldsets> => {
  const { client } = useClient();
  return useQuery({
    queryKey: [
      'contractor-onboarding-details-schema',
      countryCode,
      employmentId,
    ],
    retry: false,
    queryFn: async () => {
      return getShowContractorContractDetailsCountry({
        client: client as Client,
        path: { country_code: countryCode },
        query: {
          json_schema_version: 1,
          employment_id: employmentId,
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

const CONTRACT_PRODUCT_TITLES = {
  [contractorStandardProductIdentifier]: 'Contractor Management',
  [contractorPlusProductIdentifier]: 'Contractor Management Plus',
  [corProductIdentifier]: 'Contractor of Record',
};

export const useContractorSubscriptionSchemaField = (
  employmentId: string,
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } },
) => {
  const {
    data: contractorSubscriptions,
    isLoading: isLoading,
    refetch,
  } = useGetContractorSubscriptions({
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

  const corSubscription = contractorSubscriptions?.find(
    (subscription) => subscription.product.short_name === 'COR',
  );
  const isEligibilityQuestionnaireBlocked =
    corSubscription?.eligibility_questionnaire?.is_blocking;

  if (contractorSubscriptions) {
    const field: JSFField | undefined = form.fields.find(
      (field) => field.name === 'subscription',
    ) as JSFField | undefined;
    if (field) {
      const options = contractorSubscriptions.map((opts) => {
        const product = opts.product;
        const price = opts.price.amount;
        const currencyCode = opts.currency.code;
        const title =
          CONTRACT_PRODUCT_TITLES[
            product.identifier as keyof typeof CONTRACT_PRODUCT_TITLES
          ] ?? '';
        const label = title;
        const value = product.identifier ?? '';
        const description = product.description ?? '';
        const features = product.features ?? [];
        const meta = {
          features,
          price: {
            amount: convertFromCents(price),
            currencyCode: currencyCode,
          },
        };
        return {
          label,
          value,
          description,
          meta,
          disabled:
            isEligibilityQuestionnaireBlocked &&
            product.identifier !== contractorStandardProductIdentifier,
        };
      });
      field.options = options.sort((a, b) => a.label.localeCompare(b.label));
    }
  }

  return {
    isLoading,
    form,
    contractorSubscriptions,
    refetch,
    isEligibilityQuestionnaireBlocked,
  };
};

export const useUpdateUKandSaudiFields = (
  createContractorContractDocumentMutation: ReturnType<
    typeof useCreateContractorContractDocument
  >,
  uploadFileMutation: ReturnType<typeof useUploadFile>,
  parsedValues: FieldValues,
) => {
  const { mutateAsyncOrThrow: uploadFileMutationAsync } =
    mutationToPromise(uploadFileMutation);
  const { mutateAsyncOrThrow: createContractorContractDocumentMutationAsync } =
    mutationToPromise(createContractorContractDocumentMutation);

  return {
    mutateAsync: async ({ employmentId }: { employmentId: string }) => {
      const {
        saudi_nationality_status: saudiNationalityStatus,
        ir35: ir35Status,
        ir35_sds_file: ir35SdsFile,
      } = parsedValues;
      const ir35ContractDetailsPayload = {
        contract_document: {
          ir_35: ir35Status,
        },
      };
      const saudiContractDetailsPayload = {
        contract_document: {
          nationality: saudiNationalityStatus,
        },
      };
      if (ir35Status) {
        await createContractorContractDocumentMutationAsync({
          employmentId: employmentId,
          payload: ir35ContractDetailsPayload,
        });

        if (ir35SdsFile) {
          return uploadFileMutationAsync({
            employment_id: employmentId,
            file: ir35SdsFile,
            sub_type: IR35_FILE_SUBTYPE,
          });
        }
        return Promise.resolve();
      }
      if (saudiNationalityStatus) {
        return createContractorContractDocumentMutationAsync({
          employmentId: employmentId,
          payload: saudiContractDetailsPayload,
        });
      }

      return Promise.resolve();
    },
  };
};

export const useGetIR35File = (
  employmentId: string,
  options?: { enabled?: boolean },
) => {
  const { data: ir35Files, isLoading: isLoadingFiles } = useEmploymentFiles(
    employmentId,
    {
      sub_type: IR35_FILE_SUBTYPE,
    },
    {
      ...options,
      select: ({ data }) =>
        data?.files?.filter((file) => file.sub_type === IR35_FILE_SUBTYPE),
    },
  );
  const id = ir35Files?.[0]?.id;

  const downloadQuery = useDownloadFile(id as string);

  return {
    ...downloadQuery,
    isLoading: isLoadingFiles || downloadQuery.isLoading,
  };
};

/**
 * Get the contract documents for a given employment
 * @param employmentId - The employment ID
 * @param options - The options
 * @returns The contract documents
 */
export const useGetContractDocuments = (
  employmentId: string,
  options?: { enabled?: boolean },
) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['contract-documents', employmentId],
    queryFn: async () => {
      return getIndexEmploymentContractDocument({
        client: client as Client,
        path: { employment_id: employmentId },
      });
    },
    enabled: options?.enabled,
    select: ({ data }) => {
      return data?.data?.contract_documents;
    },
  });
};

export const useGetEligibilityQuestionnaire = ({
  options,
  fieldValues,
}: {
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } };
  fieldValues: FieldValues;
}) => {
  const { client } = useClient();
  return useQuery<
    EligibilityQuestionnaireJsonSchemaResponse['data'],
    Error,
    FormResult
  >({
    queryKey: ['eligibility-questionnaire'],
    queryFn: async (): Promise<
      EligibilityQuestionnaireJsonSchemaResponse['data']
    > => {
      const response = await getShowEligibilityQuestionnaire({
        client: client as Client,
        query: {
          type: 'contractor_of_record',
          json_schema_version: 1,
        },
      });

      // Extract the data from the response wrapper
      if (response.error) {
        throw new Error('Failed to fetch eligibility questionnaire');
      }

      return response.data
        .data as EligibilityQuestionnaireJsonSchemaResponse['data'];
    },
    select: (data: EligibilityQuestionnaireJsonSchemaResponse['data']) => {
      const schema = data?.schema || {};
      return createHeadlessForm(schema, fieldValues, {
        jsfModify: options?.jsfModify,
      });
    },
    enabled: options?.queryOptions?.enabled,
  });
};

export const usePostCreateEligibilityQuestionnaire = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: async ({
      employmentId,
      payload,
    }: {
      employmentId: string;
      payload: SubmitEligibilityQuestionnaireRequest['responses'];
    }) => {
      return postCreateEligibilityQuestionnaire({
        client: client as Client,
        body: {
          employment_slug: employmentId,
          responses: payload,
          type: 'contractor_of_record',
        },
        query: {
          json_schema_version: 1, // TODO: json_schema_version should be dynamic but fixed for now
        },
      });
    },
  });
};

export const usePostManageContractorCorSubscription = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: async ({ employmentId }: { employmentId: string }) => {
      return postManageContractorCorSubscriptionSubscription({
        client: client as Client,
        path: {
          employment_id: employmentId,
        },
      });
    },
  });
};

export const useDeleteContractorCorSubscription = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: async ({ employmentId }: { employmentId: string }) => {
      return deleteDeleteContractorCorSubscriptionSubscription({
        client: client as Client,
        path: { employment_id: employmentId },
      });
    },
  });
};
