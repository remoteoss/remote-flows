import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';
import { Client } from '@/src/client/client';
import {
  ConvertCurrencyParams,
  CreateContractEligibilityParams,
  EmploymentCreateParams,
  EmploymentFullParams,
  getIndexBenefitOffer,
  getShowCompany,
  getShowEmployment,
  getShowFormCountry,
  getShowSchema,
  getSupportedCountry,
  patchUpdateEmployment2,
  postConvertRawCurrencyConverter,
  postConvertWithSpreadCurrencyConverter,
  postCreateContractEligibility,
  postCreateEmployment2,
  postCreateRiskReserve,
  postInviteEmploymentInvitation,
  PostInviteEmploymentInvitationData,
  putUpdateBenefitOffer,
  UnifiedEmploymentUpsertBenefitOffersRequest,
} from '@/src/client';

import { useClient } from '@/src/context';
import { selectCountryStepSchema } from '@/src/flows/Onboarding/json-schemas/selectCountryStep';
import { OnboardingFlowProps } from '@/src/flows/Onboarding/types';
import {
  JSONSchemaFormResultWithFieldsets,
  JSONSchemaFormType,
  FlowOptions,
} from '@/src/flows/types';
import { getContractDetailsSchemaVersion } from '@/src/flows/Onboarding/utils';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';

export const useEmployment = (employmentId: string | undefined) => {
  const { client } = useClient();

  return useQuery({
    queryKey: ['employment', employmentId],
    retry: false,
    enabled: !!employmentId,
    select: ({ data }) => {
      return data?.data.employment;
    },
    queryFn: async () => {
      const response = await getShowEmployment({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          employment_id: employmentId as string,
        },
      });

      // If response status is 404 or other error, throw an error to trigger isError
      if (response.error || !response.data) {
        throw new Error('Failed to fetch employment data');
      }

      return response;
    },
  });
};

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
    queryKey: ['onboarding-json-schema-form', countryCode, form],
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
  const jsonSchemaQueryParam = options?.jsonSchemaVersion
    ?.benefit_offers_form_schema
    ? {
        json_schema_version:
          options.jsonSchemaVersion.benefit_offers_form_schema,
      }
    : {};
  const { client } = useClient();
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
export const useCreateEmployment = () => {
  const { client } = useClient();
  // TODO: setting 1 as basic_information only supports v1 for now in the API
  const jsonSchemaQueryParam = {
    json_schema_version: 1,
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
    // TODO: setting 1 as basic_information only supports v1 for now in the API
    employment_basic_information_json_schema_version: 1,
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
      const jsonSchemaQueryParam = options?.jsonSchemaVersion
        ?.benefit_offers_form_schema
        ? {
            json_schema_version:
              options.jsonSchemaVersion.benefit_offers_form_schema,
          }
        : {};
      return putUpdateBenefitOffer({
        client: client as Client,
        body: payload,
        path: {
          employment_id: employmentId,
        },
        query: {
          ...jsonSchemaQueryParam,
        },
      });
    },
  });
};

const useCountries = (queryOptions?: { enabled?: boolean }) => {
  const { client } = useClient();
  return useQuery({
    ...queryOptions,
    queryKey: ['countries'],
    retry: false,
    queryFn: async () => {
      const response = await getSupportedCountry({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
      });

      // If response status is 404 or other error, throw an error to trigger isError
      if (response.error || !response.data) {
        throw new Error('Failed to fetch supported countries');
      }

      return response;
    },
    select: ({ data }) => {
      return (
        data?.data
          ?.filter((country) => country.eor_onboarding)
          .map((country) => {
            return {
              label: country.name,
              value: country.code,
            };
          }) || []
      );
    },
  });
};

export const useCountriesSchemaField = (
  options?: Omit<FlowOptions, 'jsonSchemaVersion'> & {
    queryOptions?: { enabled?: boolean };
  },
) => {
  const { data: countries, isLoading } = useCountries(options?.queryOptions);

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
