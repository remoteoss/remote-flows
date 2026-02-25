import { useMutation } from '@tanstack/react-query';
import { useClient } from '@/src/context';
import { Client } from '@/src/client/client';
import { FieldValues } from 'react-hook-form';
import { FlowOptions } from '@/src/flows/types';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { companyBasicInformationStepSchema } from '@/src/flows/CreateCompany/json-schemas/companyBasicInformationStep';
import { useQuery } from '@tanstack/react-query';
import { getIndexCompanyCurrency } from '@/src/client';
import { countriesOptions } from '@/src/common/api/countries';
import {
  CreateCompanyParams,
  getShowFormCountry,
  postCreateCompany,
  patchUpdateCompany2,
  UpdateCompanyParams,
} from '@/src/client';

/**
 * Hook to fetch company currencies
 * @param queryOptions - Query options including enabled flag
 * @returns Query result with currencies formatted for select dropdown
 */
const useCompanyCurrencies = (queryOptions?: { enabled?: boolean }) => {
  const { client } = useClient();
  return useQuery({
    ...queryOptions,
    queryKey: ['company-currencies'],
    retry: false,
    queryFn: async () => {
      const response = await getIndexCompanyCurrency({
        client: client as Client,
      });

      if (response.error || !response.data) {
        throw new Error('Failed to fetch company currencies');
      }

      return response;
    },
    select: ({ data }) => {
      return (
        data?.data?.company_currencies.map((currency) => ({
          value: currency.code,
          label: currency.code,
        })) || []
      );
    },
  });
};

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

/**
 * Hook to create the select country form with populated country and currency options
 * @param options - Flow options including jsfModify and queryOptions
 * @returns Form with populated country and currency fields, and loading state
 */
export const useCountriesSchemaField = (
  options?: Omit<FlowOptions, 'jsonSchemaVersion'> & {
    queryOptions?: { enabled?: boolean };
  },
) => {
  const { client } = useClient();
  const { data: countries, isLoading: isLoadingCountries } = useQuery({
    ...countriesOptions(client as Client, 'create-company-countries'),
    select: (response) => {
      return (
        response.data?.data
          ?.filter((country) => country.eor_onboarding)
          .map((country) => ({
            label: country.name,
            value: country.code,
          })) || []
      );
    },
    enabled: options?.queryOptions?.enabled,
  });
  const { data: currencies, isLoading: isLoadingCurrencies } =
    useCompanyCurrencies(options?.queryOptions);

  const companyBasicInformationForm = createHeadlessForm(
    companyBasicInformationStepSchema.data.schema,
    {},
    options,
  );

  if (countries) {
    const countryField = companyBasicInformationForm.fields.find(
      (field) => field.name === 'country_code',
    );
    if (countryField) {
      countryField.options = countries;
    }
  }

  if (currencies) {
    const currencyField = companyBasicInformationForm.fields.find(
      (field) => field.name === 'desired_currency',
    );
    if (currencyField) {
      currencyField.options = currencies;
    }
  }

  return {
    isLoading: isLoadingCountries || isLoadingCurrencies,
    companyBasicInformationForm,
  };
};

/**
 * Hook to fetch address details schema for a given country
 * @param countryCode - The country code to fetch schema for
 * @param fieldValues - Current field values for the form
 * @param options - Flow options including jsfModify and queryOptions
 * @returns Query result with address details form schema
 */
export const useAddressDetailsSchema = ({
  countryCode,
  fieldValues,
  options,
}: {
  countryCode: string | null;
  fieldValues: FieldValues;
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } };
}) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['company-address-details-schema', countryCode],
    retry: false,
    queryFn: async () => {
      if (!countryCode) {
        throw new Error('Country code is required');
      }
      const response = await getShowFormCountry({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          country_code: countryCode,
          form: 'address_details',
        },
        query: {
          json_schema_version:
            options?.jsonSchemaVersion?.form_schema?.address_details ||
            'latest',
        },
      });

      if (response.error || !response.data) {
        throw new Error('Failed to fetch address details schema');
      }

      return response;
    },
    enabled: options?.queryOptions?.enabled && !!countryCode,
    select: ({ data }) => {
      const jsfSchema = data?.data || {};
      return createHeadlessForm(jsfSchema, fieldValues, options);
    },
  });
};
