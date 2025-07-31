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
  MagicLinkParams,
  patchUpdateEmployment2,
  postConvertCurrencyConverter,
  postCreateContractEligibility,
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
import { JSFFieldset } from '@/src/types/remoteFlows';
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
  query = {},
}: {
  countryCode: string;
  form: JSONSchemaFormType;
  fieldValues: FieldValues;
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } };
  query?: Record<string, unknown>;
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

      return {
        meta: {
          'x-jsf-fieldsets': jsfSchema['x-jsf-fieldsets'] as JSFFieldset,
        },
        ...createHeadlessForm(jsfSchema, {
          initialValues: {
            ...fieldValues,
            ...moneyFieldsData,
          },
        }),
      };
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
export const useCreateEmployment = (
  options?: OnboardingFlowParams['options'],
) => {
  const { client } = useClient();
  const jsonSchemaQueryParam = options?.jsonSchemaVersion?.form_schema
    ?.employment_basic_information
    ? {
        json_schema_version:
          options.jsonSchemaVersion.form_schema.employment_basic_information,
      }
    : {};
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
  options?: OnboardingFlowParams['options'],
) => {
  const { client } = useClient();
  const jsonSchemaQueryParams = {
    employment_basic_information_json_schema_version:
      options?.jsonSchemaVersion?.form_schema?.employment_basic_information,
    employment_contract_details_json_schema_version:
      options?.jsonSchemaVersion?.form_schema?.contract_details,
  };

  const filteredQueryParams = Object.fromEntries(
    Object.entries(jsonSchemaQueryParams).filter(
      ([, value]) => value !== undefined,
    ),
  );

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
          ...filteredQueryParams,
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

export const useCountriesSchemaField = (
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } },
) => {
  const { data: countries, isLoading } = useCountries(options?.queryOptions);

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

export const useUpsertContractEligibility = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: ({
      employmentId,
      ...payload
    }: { employmentId: string } & CreateContractEligibilityParams) => {
      return postCreateContractEligibility({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          employment_id: employmentId,
        },
        body: payload,
      });
    },
  });
};

export const useZendeskArticle = (
  zendeskId?: string,
  queryOptions?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['zendesk-article', zendeskId],
    queryFn: async () => {
      if (!zendeskId) {
        return Promise.reject(new Error('Zendesk ID is required'));
      }
      return Promise.resolve({
        data: {
          id: zendeskId,
          title: 'What countries offer 13th/14th month salary payments?',
          body: '<p>It\'s common practice in many countries around the world to pay a holiday bonus which is either extra amount on top of the base salary or is the employee\'s annual salary divided over extra repayments. This can often be as much as the full monthly salary payment and is often referred to as the 13th (or 14th in the case of two extra payments) payment.</p>\n<p>Depending on the country, the amount and reference will vary. You can read more about this in each country\'s explorer page: <a href="https://remote.com/country-explorer">https://remote.com/country-explorer.</a></p>\n<p dir="auto" data-sourcepos="9:1-9:33"><strong>Countries with 13th month salary:</strong></p>\n<ul dir="auto" data-sourcepos="11:1-20:0">\n<li data-sourcepos="15:1-15:147">\n<a href="https://remote.com/country-explorer/argentina#employing" target="_blank" rel="noopener noreferrer">Argentina</a> 🇦🇷 </li>\n<li data-sourcepos="11:1-11:154">\n<a href="https://remote.com/country-explorer/belgium#employing" target="_blank" rel="noopener noreferrer">Belgium</a> 🇧🇪 </li>\n<li data-sourcepos="11:1-11:154">\n<a href="https://remote.com/country-explorer/bolivia#employing" target="_blank" rel="noopener noreferrer">Bolivia</a> 🇧🇴 </li>\n<li data-sourcepos="11:1-11:154">\n<a href="https://remote.com/country-explorer/brazil#employing" target="_blank" rel="noopener noreferrer">Brazil</a> 🇧🇷 </li>\n<li data-sourcepos="11:1-11:154">\n<a href="https://remote.com/country-explorer/colombia#employing" target="_blank" rel="noopener noreferrer">Colombia</a> 🇨🇴 </li>\n<li>\n<a href="https://remote.com/country-explorer/costa-rica#employing" target="_blank" rel="noopener noreferrer">Costa Rica</a> 🇨🇷</li>\n<li data-sourcepos="11:1-11:154">\n<a href="https://remote.com/country-explorer/dominican-republic#employing" target="_blank" rel="noopener noreferrer">Dominican Republic</a> 🇩🇴 </li>\n<li data-sourcepos="11:1-11:154">\n<a href="https://remote.com/country-explorer/el-salvador">El Salvador</a> 🇸🇻</li>\n<li data-sourcepos="11:1-11:154">\n<a href="https://remote.com/country-explorer/guatemala">Guatamala</a> 🇬🇹</li>\n<li>\n<a href="https://remote.com/country-explorer/mexico#employing" target="_blank" rel="noopener noreferrer">Mexico</a> 🇲🇽 </li>\n<li data-sourcepos="19:1-20:0">\n<a href="https://remote.com/country-explorer/panama#employing" target="_blank" rel="noopener noreferrer">Panama</a> 🇵🇦 </li>\n<li data-sourcepos="19:1-20:0">\n<a href="https://remote.com/country-explorer/paraguay#employing" target="_blank" rel="noopener noreferrer">Paraguay</a> 🇵🇾 </li>\n<li data-sourcepos="19:1-20:0">\n<a href="https://remote.com/country-explorer/philippines#employing" target="_blank" rel="noopener noreferrer">Philippines</a> 🇵🇭 </li>\n<li data-sourcepos="12:1-12:197">\n<a href="https://remote.com/country-explorer/slovenia#employing" target="_blank" rel="noopener noreferrer">Slovenia</a> 🇸🇮</li>\n<li data-sourcepos="12:1-12:197">\n<a href="https://remote.com/country-explorer/uruguay#employing" target="_blank" rel="noopener noreferrer">Uruguay</a> 🇺🇾 </li>\n</ul>\n<p dir="auto" data-sourcepos="21:1-21:42"><strong>Countries with 13th and 14th month salary:</strong></p>\n<ul dir="auto" data-sourcepos="23:1-29:0">\n<li data-sourcepos="23:1-23:154">\n<a href="https://remote.com/country-explorer/austria#employing" target="_blank" rel="noopener noreferrer">Austria</a> 🇦🇹 </li>\n<li data-sourcepos="23:1-23:154">\n<a href="https://remote.com/country-explorer/ecuador#employing" target="_blank" rel="noopener noreferrer">Ecuador</a> 🇪🇨 </li>\n<li data-sourcepos="23:1-23:154">\n<a href="https://remote.com/country-explorer/greece#employing" target="_blank" rel="noopener noreferrer">Greece</a> 🇬🇷 </li>\n<li data-sourcepos="23:1-23:154">\n<a href="https://remote.com/country-explorer/honduras#employing" target="_blank" rel="noopener noreferrer">Honduras</a> 🇭🇳 </li>\n<li data-sourcepos="25:1-25:143">\n<a href="https://remote.com/country-explorer/italy#employing" target="_blank" rel="noopener noreferrer">Italy</a> 🇮🇹 </li>\n<li data-sourcepos="23:1-23:154">\n<a href="https://remote.com/country-explorer/peru#employing" target="_blank" rel="noopener noreferrer">Peru</a> 🇵🇪 </li>\n<li data-sourcepos="26:1-26:174">\n<a href="https://remote.com/country-explorer/portugal#employing" target="_blank" rel="noopener noreferrer">Portugal</a> 🇵🇹 </li>\n<li data-sourcepos="27:1-29:0">\n<a href="https://remote.com/country-explorer/spain#employing" target="_blank" rel="noopener noreferrer">Spain</a> 🇪🇸 </li>\n</ul>',
          html_url:
            'https://support.remote.com/hc/en-us/articles/4466822781709-What-countries-offer-13th-14th-month-salary-payments',
        },
      });
    },
    ...queryOptions,
  });
};
