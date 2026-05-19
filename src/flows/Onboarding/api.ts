import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';
import { Client } from '@/src/client/client';
import {
  ConvertCurrencyParams,
  CreateContractEligibilityParams,
  EmploymentCreateParams,
  EmploymentEngagementAgreementDetailsParams,
  EmploymentFullParams,
  FindOrCreatePreOnboardingDocumentParams,
  getV1CompaniesCompanyId,
  getV1CompaniesCompanyIdEmploymentsEmploymentIdOnboardingReservesStatus,
  getV1CountriesCountryCodeEngagementAgreementDetails,
  getV1CountriesCountryCodeForm,
  getV1EmploymentsEmploymentIdBenefitOffers,
  getV1EmploymentsEmploymentIdBenefitOffersSchema,
  getV1EmploymentsEmploymentIdEngagementAgreementDetails,
  getV1OnboardingEmploymentsEmploymentIdPreOnboardingDocumentsId,
  getV1OnboardingEmploymentsEmploymentIdPreOnboardingDocumentsRequirements,
  patchV1EmploymentsEmploymentId2,
  postV1CurrencyConverterEffective,
  postV1CurrencyConverterRaw,
  postV1Employments,
  postV1EmploymentsEmploymentIdContractEligibility,
  postV1EmploymentsEmploymentIdEngagementAgreementDetails,
  postV1EmploymentsEmploymentIdInvite,
  PostV1EmploymentsEmploymentIdInviteData,
  postV1OnboardingEmploymentsEmploymentIdPreOnboardingDocuments,
  postV1OnboardingEmploymentsEmploymentIdPreOnboardingDocumentsIdSign,
  postV1RiskReserve,
  putV1EmploymentsEmploymentIdBenefitOffers,
  UnifiedEmploymentUpsertBenefitOffersRequest,
} from '@/src/client';

import { useClient } from '@/src/context';
import { selectCountryStepSchema } from '@/src/flows/Onboarding/json-schemas/selectCountryStep';
import {
  OnboardingFlowProps,
  OnboardingJsfModify,
} from '@/src/flows/Onboarding/types';
import {
  JSONSchemaFormResultWithFieldsets,
  JSONSchemaFormType,
  FlowOptions,
} from '@/src/flows/types';
import {
  getContractDetailsSchemaVersion,
  getBasicInformationSchemaVersion,
  getBenefitOffersSchemaVersion,
} from '@/src/flows/Onboarding/utils';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { countriesOptions } from '@/src/common/api/countries';

export const useCompany = (companyId: string) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['company', companyId],
    retry: false,
    enabled: !!companyId,
    queryFn: async () => {
      const response = await getV1CompaniesCompanyId({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          company_id: companyId,
        },
      });

      if (response.error || !response.data) {
        throw new Error('Failed to fetch employment data');
      }

      return response;
    },
    select: ({ data }) => {
      return data.data.company;
    },
  });
};

export const useBenefitOffers = (employmentId: string | undefined) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['benefit-offers', employmentId],
    retry: false,
    enabled: !!employmentId,
    queryFn: async () => {
      return getV1EmploymentsEmploymentIdBenefitOffers({
        client: client as Client,
        path: {
          employment_id: employmentId as string,
        },
      }).then((response) => {
        // If response status is 404 or other error, throw an error to trigger isError
        if (response.error || !response.data) {
          throw new Error('Failed to fetch benefit offers data');
        }

        return response;
      });
    },
    select: ({ data }) =>
      data?.data?.reduce(
        (acc, item) => {
          return {
            ...acc,
            [item.benefit_group.slug]: {
              value: item.benefit_tier?.slug ?? 'no',
              ...(item.benefit_group?.filter?.slug
                ? { filter: item.benefit_group?.filter?.slug }
                : {}),
            },
          };
        },
        {} as Record<string, { value: string }>,
      ),
  });
};

export const useEmploymentEngagementAgreementDetails = (
  employmentId: string | undefined,
  queryOptions?: { enabled?: boolean },
) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['employment-engagement-agreement-details', employmentId],
    retry: false,
    enabled: queryOptions?.enabled ?? !!employmentId,
    queryFn: async () => {
      return getV1EmploymentsEmploymentIdEngagementAgreementDetails({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          employment_id: employmentId as string,
        },
      }).then((response) => {
        if (response.error || !response.data) {
          throw new Error('Failed to fetch engagement agreement details');
        }
        return response;
      });
    },
    select: ({ data }) => data?.data?.details,
  });
};

/**
 * Use this hook to invite an employee to the onboarding flow
 * @returns
 */
export const useEmploymentInvite = () => {
  const { client } = useClient();

  return useMutation({
    mutationFn: (payload: PostV1EmploymentsEmploymentIdInviteData['path']) => {
      return postV1EmploymentsEmploymentIdInvite({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: payload,
      });
    },
  });
};

export const useCreateReserveInvoice = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (payload: { employment_slug: string }) => {
      return postV1RiskReserve({
        client: client as Client,
        body: payload,
      });
    },
  });
};

/**
 * Use this hook to get the JSON schema form for the onboarding flow
 * @param param0
 * @returns
 */
export const useJSONSchemaForm = ({
  countryCode,
  form,
  fieldValues,
  options,
  query = {},
  jsonSchemaVersion,
}: {
  countryCode: string;
  form: JSONSchemaFormType;
  fieldValues: FieldValues;
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } };
  query?: Record<string, unknown>;
  jsonSchemaVersion?: number | 'latest';
}): UseQueryResult<JSONSchemaFormResultWithFieldsets> => {
  const { client } = useClient();
  const jsonSchemaQueryParam = jsonSchemaVersion
    ? {
        json_schema_version: jsonSchemaVersion,
      }
    : {};
  return useQuery({
    queryKey: [
      'onboarding-json-schema-form',
      countryCode,
      form,
      jsonSchemaVersion,
    ],
    retry: false,
    queryFn: async () => {
      const response = await getV1CountriesCountryCodeForm({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          country_code: countryCode,
          form: form,
        },
        query: {
          skip_benefits: true,
          ...query,
          ...jsonSchemaQueryParam,
        },
      });

      // If response status is 404 or other error, throw an error to trigger isError
      if (response.error || !response.data) {
        throw new Error('Failed to fetch onboarding schema');
      }

      return response;
    },
    enabled: options?.queryOptions?.enabled,
    select: ({ data }) => {
      const jsfSchema = data?.data || {};
      return createHeadlessForm(jsfSchema, fieldValues, options);
    },
  });
};

export const useBenefitOffersSchema = (
  employmentId: string,
  fieldValues: FieldValues,
  options: OnboardingFlowProps['options'],
) => {
  const { client } = useClient();
  const jsonSchemaQueryParam = {
    json_schema_version: getBenefitOffersSchemaVersion(options),
  };

  return useQuery({
    queryKey: ['benefit-offers-schema', employmentId],
    retry: false,
    enabled: !!employmentId,
    queryFn: async () => {
      const response = await getV1EmploymentsEmploymentIdBenefitOffersSchema({
        client: client as Client,
        path: {
          employment_id: employmentId,
        },
        query: jsonSchemaQueryParam,
      });

      // If response status is 404 or other error, throw an error to trigger isError
      if (response.error || !response.data) {
        throw new Error('Failed to fetch benefit offers schema');
      }

      return response;
    },
    select: ({ data }) => {
      const jsfSchema = data?.data?.schema || {};

      return createHeadlessForm(jsfSchema, fieldValues, {
        jsfModify: options?.jsfModify?.benefits,
      });
    },
  });
};

/**
 * Use this hook to create an employment
 * @returns
 */
export const useCreateEmployment = (
  options?: OnboardingFlowProps['options'],
) => {
  const { client } = useClient();
  const jsonSchemaQueryParam = {
    json_schema_version: getBasicInformationSchemaVersion(options),
  };
  return useMutation({
    mutationFn: (payload: EmploymentCreateParams) => {
      return postV1Employments({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
        query: {
          ...jsonSchemaQueryParam,
        },
      });
    },
  });
};

export const useUpdateEmployment = (
  countryCode: string,
  options?: OnboardingFlowProps['options'],
) => {
  const { client } = useClient();
  const jsonSchemaQueryParams = {
    employment_basic_information_json_schema_version:
      getBasicInformationSchemaVersion(options),
    contract_details_json_schema_version:
      getContractDetailsSchemaVersion(options, countryCode) || 1,
  };

  return useMutation({
    mutationFn: ({
      employmentId,
      ...payload
    }: EmploymentFullParams & { employmentId: string }) => {
      return patchV1EmploymentsEmploymentId2({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
        path: {
          employment_id: employmentId,
        },
        query: {
          skip_benefits: true,
          ...jsonSchemaQueryParams,
        },
      });
    },
  });
};

export const useUpdateEmploymentEngagementAgreementDetails = () => {
  const { client } = useClient();

  return useMutation({
    mutationFn: ({
      employmentId,
      ...payload
    }: EmploymentEngagementAgreementDetailsParams & {
      employmentId: string;
    }) => {
      return postV1EmploymentsEmploymentIdEngagementAgreementDetails({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
        path: {
          employment_id: employmentId,
        },
      });
    },
  });
};

export const useUpdateBenefitsOffers = (
  options?: OnboardingFlowProps['options'],
) => {
  const { client } = useClient();
  return useMutation({
    mutationFn: ({
      employmentId,
      ...payload
    }: UnifiedEmploymentUpsertBenefitOffersRequest & {
      employmentId: string;
    }) => {
      const jsonSchemaQueryParam = {
        json_schema_version: getBenefitOffersSchemaVersion(options),
      };

      return putV1EmploymentsEmploymentIdBenefitOffers({
        client: client as Client,
        body: payload,
        path: {
          employment_id: employmentId,
        },
        query: jsonSchemaQueryParam,
      });
    },
  });
};

export const useCountriesSchemaField = (
  options?: Omit<FlowOptions, 'jsonSchemaVersion'> & {
    queryOptions?: { enabled?: boolean };
  },
) => {
  const { client } = useClient();
  const { data: countries, isLoading } = useQuery({
    ...countriesOptions(client as Client, 'onboarding-countries'),
    select: (response) => {
      return (
        response.data?.data
          ?.filter((country) => country.eor_onboarding)
          .map((country) => {
            return {
              label: country.name,
              value: country.code,
            };
          }) || []
      );
    },
    enabled: options?.queryOptions?.enabled,
  });

  const selectCountryForm = createHeadlessForm(
    selectCountryStepSchema.data.schema,
    {},
    options,
  );

  if (countries) {
    const countryField = selectCountryForm.fields.find(
      (field) => field.name === 'country',
    );
    if (countryField) {
      countryField.options = countries;
    }
  }

  return {
    isLoading,
    selectCountryForm,
  };
};

export const useConvertCurrency = ({
  type = 'spread',
}: {
  type?: 'spread' | 'no_spread';
}) => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (payload: ConvertCurrencyParams) => {
      const apiFn =
        type === 'no_spread'
          ? postV1CurrencyConverterRaw
          : postV1CurrencyConverterEffective;
      return apiFn({
        client: client as Client,
        body: payload,
      });
    },
  });
};

export const useUpsertContractEligibility = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: ({
      employmentId,
      ...payload
    }: { employmentId: string } & CreateContractEligibilityParams) => {
      return postV1EmploymentsEmploymentIdContractEligibility({
        client: client as Client,
        path: {
          employment_id: employmentId,
        },
        body: payload,
      });
    },
  });
};

/**
 * Hook to fetch onboarding reserves status for an employment
 * @param companyId - Company ID
 * @param employmentId - Employment ID
 * @param enabled - Whether the query should be enabled
 * @returns Query result with onboarding reserves status
 */
export const useEmploymentOnboardingReservesStatus = (
  companyId: string | undefined,
  employmentId: string | undefined,
  enabled = true,
) => {
  const { client } = useClient();
  return useQuery({
    queryKey: [
      'employment-onboarding-reserves-status',
      companyId,
      employmentId,
    ],
    retry: false,
    enabled: enabled && !!companyId && !!employmentId,
    queryFn: async () => {
      const response =
        await getV1CompaniesCompanyIdEmploymentsEmploymentIdOnboardingReservesStatus(
          {
            client: client as Client,
            headers: {
              Authorization: ``,
            },
            path: {
              company_id: companyId as string,
              employment_id: employmentId as string,
            },
          },
        );

      if (response.error || !response.data) {
        throw new Error(
          'Failed to fetch employment onboarding reserves status',
        );
      }

      return response;
    },
    select: ({ data }) => data?.data?.status,
  });
};

export const useEngagementAgreementDetailsSchema = (
  countryCode: string,
  fieldValues: FieldValues,
  options?: {
    jsfModify?: OnboardingJsfModify;
    queryOptions?: { enabled?: boolean };
  },
) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['engagement-agreement-details', countryCode],
    retry: false,
    enabled: options?.queryOptions?.enabled ?? !!countryCode,
    queryFn: async () => {
      const response =
        await getV1CountriesCountryCodeEngagementAgreementDetails({
          client: client as Client,
          path: {
            country_code: countryCode,
          },
        });

      if (response.error || !response.data) {
        throw new Error('Failed to fetch engagement agreement details');
      }

      return response;
    },
    select: ({ data }) => {
      const jsfSchema = data?.data?.schema || {};

      return createHeadlessForm(jsfSchema, fieldValues, {
        jsfModify: options?.jsfModify?.engagement_agreement_details,
      });
    },
  });
};

/**
 * Get pre-onboarding requirements for an employment
 */
export const useGetPreOnboardingRequirements = (
  employmentId: string,
  options?: { queryOptions?: { enabled?: boolean } },
) => {
  const { client } = useClient();

  return useQuery({
    queryKey: ['pre-onboarding-requirements', employmentId],
    queryFn: () =>
      getV1OnboardingEmploymentsEmploymentIdPreOnboardingDocumentsRequirements({
        client: client as Client,
        path: {
          employment_id: employmentId,
        },
      }),
    enabled: options?.queryOptions?.enabled ?? true,
    select: (response) => response.data?.data,
  });
};

/**
 * Create a pre-onboarding document
 */
export const useCreatePreOnboardingDocument = () => {
  const { client } = useClient();

  return useMutation({
    mutationFn: ({
      employmentId,
      body,
    }: {
      employmentId: string;
      body: FindOrCreatePreOnboardingDocumentParams;
    }) => {
      return postV1OnboardingEmploymentsEmploymentIdPreOnboardingDocuments({
        client: client as Client,

        body,
        path: {
          employment_id: employmentId,
        },
      });
    },
  });
};

/**
 * Get pre-onboarding document preview
 */
export const useGetPreOnboardingDocument = (
  employmentId: string,
  documentId: string | undefined,
  options?: { queryOptions?: { enabled?: boolean } },
) => {
  const { client } = useClient();

  return useQuery({
    queryKey: ['pre-onboarding-document', employmentId, documentId],
    queryFn: () =>
      getV1OnboardingEmploymentsEmploymentIdPreOnboardingDocumentsId({
        client: client as Client,
        path: {
          employment_id: employmentId,
          id: documentId!,
        },
      }),
    enabled: (options?.queryOptions?.enabled ?? true) && !!documentId,
    select: (response) => response.data?.data,
  });
};

/**
 * Sign a pre-onboarding document
 */
export const useSignPreOnboardingDocument = () => {
  const { client } = useClient();

  return useMutation({
    mutationFn: ({
      employmentId,
      documentId,
      signature,
    }: {
      employmentId: string;
      documentId: string;
      signature: string;
    }) =>
      postV1OnboardingEmploymentsEmploymentIdPreOnboardingDocumentsIdSign({
        client: client as Client,
        path: {
          employment_id: employmentId,
          id: documentId,
        },
        body: {
          signature,
        },
      }),
  });
};
