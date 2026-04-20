import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';
import { Client } from '@/src/client/client';
import {
  ConvertCurrencyParams,
  CreateContractEligibilityParams,
  EmploymentCreateParams,
  EmploymentEngagementAgreementDetailsParams,
  EmploymentFullParams,
  getIndexBenefitOffer,
  getShowCompany,
  getShowCompanyEmploymentOnboardingReservesStatus,
  getShowEngagementAgreementDetailsCountry,
  getShowFormCountry,
  getShowSchema,
  patchUpdateEmployment2,
  postConvertRawCurrencyConverter,
  postConvertWithSpreadCurrencyConverter,
  postCreateContractEligibility,
  postCreateEmployment2,
  postCreateRiskReserve,
  postInviteEmploymentInvitation,
  PostInviteEmploymentInvitationData,
  postUpdateEmploymentEngagementAgreementDetails,
  putUpdateBenefitOffer,
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
      const response = await getShowCompany({
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
      return getIndexBenefitOffer({
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
/**
 * Use this hook to invite an employee to the onboarding flow
 * @returns
 */
export const useEmploymentInvite = () => {
  const { client } = useClient();

  return useMutation({
    mutationFn: (payload: PostInviteEmploymentInvitationData['path']) => {
      return postInviteEmploymentInvitation({
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
      return postCreateRiskReserve({
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
      const response = await getShowFormCountry({
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
      const response = await getShowSchema({
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
      return postCreateEmployment2({
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
      return patchUpdateEmployment2({
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
    }: EmploymentEngagementAgreementDetailsParams & { employmentId: string }) => {
      return postUpdateEmploymentEngagementAgreementDetails({
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

      return putUpdateBenefitOffer({
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
          ? postConvertRawCurrencyConverter
          : postConvertWithSpreadCurrencyConverter;
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
      return postCreateContractEligibility({
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
      const response = await getShowCompanyEmploymentOnboardingReservesStatus({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          company_id: companyId as string,
          employment_id: employmentId as string,
        },
      });

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
      const response = await getShowEngagementAgreementDetailsCountry({
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
