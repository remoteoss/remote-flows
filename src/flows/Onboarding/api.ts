import {
  ConvertCurrencyParams,
  EmploymentCreateParams,
  EmploymentFullParams,
  getIndexBenefitOffer,
  getShowCompany,
  getShowEmployment,
  getShowFormCountry,
  getShowSchema,
  getSupportedCountry,
  MagicLinkParams,
  patchUpdateEmployment2,
  postConvertCurrencyConverter,
  postCreateEmployment2,
  postCreateRiskReserve,
  postGenerateMagicLink,
  postInviteEmploymentInvitation,
  PostInviteEmploymentInvitationData,
  putUpdateBenefitOffer,
  UnifiedEmploymentUpsertBenefitOffersRequest,
} from '@/src/client';
import { convertToCents } from '@/src/components/form/utils';
import { useClient } from '@/src/context';
import { selectCountryStepSchema } from '@/src/flows/Onboarding/json-schemas/selectCountryStep';
import { OnboardingFlowParams } from '@/src/flows/Onboarding/types';
import { FlowOptions, JSONSchemaFormType } from '@/src/flows/types';
import { findFieldsByType } from '@/src/flows/utils';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';

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
        headers: {
          Authorization: ``,
        },
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
              value: item.benefit_tier?.slug ?? '',
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
        headers: {
          Authorization: ``,
        },
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
}: {
  countryCode: string;
  form: JSONSchemaFormType;
  fieldValues: FieldValues;
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } };
}) => {
  const { client } = useClient();
  const jsonSchemaQueryParam = options?.jsonSchemaVersion?.form_schema?.[form]
    ? {
        json_schema_version: options.jsonSchemaVersion.form_schema[form],
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
      let jsfSchema = data?.data || {};
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

      return createHeadlessForm(jsfSchema, {
        initialValues: {
          ...fieldValues,
          ...moneyFieldsData,
        },
      });
    },
  });
};

export const useBenefitOffersSchema = (
  employmentId: string,
  fieldValues: FieldValues,
  options: OnboardingFlowParams['options'],
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
        headers: {
          Authorization: ``,
        },
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
      let jsfSchema = data?.data?.schema || {};

      if (options && options.jsfModify?.benefits) {
        const { schema } = modify(jsfSchema, options.jsfModify.benefits);
        jsfSchema = schema;
      }
      const hasFieldValues = Object.keys(fieldValues).length > 0;
      const result = createHeadlessForm(jsfSchema, {
        // we need to clone the fieldValues to prevent side effects
        // if we don't do this, the benefits get included in the other steps
        initialValues: hasFieldValues ? { ...fieldValues } : {},
      });
      return result;
    },
  });
};

/**
 * Use this hook to create an employment
 * @returns
 */
export const useCreateEmployment = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (payload: EmploymentCreateParams) => {
      return postCreateEmployment2({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
      });
    },
  });
};

export const useUpdateEmployment = () => {
  const { client } = useClient();
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
        },
      });
    },
  });
};

export const useUpdateBenefitsOffers = (
  options?: OnboardingFlowParams['options'],
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
        headers: {
          Authorization: ``,
        },
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

export const useMagicLink = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (params: MagicLinkParams) => {
      return postGenerateMagicLink({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: params,
      });
    },
  });
};

const useCountries = () => {
  const { client } = useClient();
  return useQuery({
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
        data?.data?.map((country) => {
          return {
            label: country.name,
            value: country.code,
          };
        }) || []
      );
    },
  });
};

export const useCountriesSchemaField = (options?: FlowOptions) => {
  const { data: countries, isLoading } = useCountries();

  const { schema: selectCountrySchema } = modify(
    selectCountryStepSchema.data.schema,
    options?.jsfModify || {},
  );

  const selectCountryForm = createHeadlessForm(selectCountrySchema);

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

export const useConvertCurrency = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (payload: ConvertCurrencyParams) => {
      return postConvertCurrencyConverter({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
      });
    },
  });
};
