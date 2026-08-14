import { useMemo } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';
import {
  getV1CountriesCountryCodeContractorContractDetails,
  getV1ContractorsEmploymentsEmploymentIdContractorCurrencies,
} from '@/src/client';
import { useClient } from '@/src/context';
import { Client } from '@/src/client/client';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import {
  FlowOptions,
  JSONSchemaFormResultWithFieldsets,
} from '@/src/flows/types';
import { $TSFixMe } from '@/src/types/remoteFlows';

const useContractorCurrencies = ({
  employmentId,
  options,
}: {
  employmentId: string;
  options?: { queryOptions?: { enabled?: boolean } };
}) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['contractor-currencies', employmentId],
    queryFn: async () => {
      return getV1ContractorsEmploymentsEmploymentIdContractorCurrencies({
        client: client as Client,
        path: { employment_id: employmentId },
        query: {
          restrict_to_guaranteed_pay_out_currencies: false,
        },
      });
    },
    enabled: options?.queryOptions?.enabled,
    select: ({ data }) => {
      return data?.data;
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
const useContractorOnboardingDetailsSchema = ({
  countryCode,
  employmentId,
  fieldValues,
  options,
}: {
  countryCode: string;
  fieldValues: FieldValues;
  employmentId: string;
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } };
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
      return getV1CountriesCountryCodeContractorContractDetails({
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

/**
 * Get contractor onboarding details schema with currency options overridden
 * from the getIndexContractorCurrency endpoint
 */
export const useContractorContractDetailsSchema = ({
  countryCode,
  employmentId,
  fieldValues,
  options,
}: {
  countryCode: string;
  fieldValues: FieldValues;
  employmentId: string;
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } };
}) => {
  const schemaQuery = useContractorOnboardingDetailsSchema({
    countryCode,
    employmentId,
    fieldValues,
    options,
  });

  const { data: currencies, isLoading: isLoadingCurrencies } =
    useContractorCurrencies({
      employmentId,
      options: {
        queryOptions: { enabled: options?.queryOptions?.enabled },
      },
    });

  const dataWithCurrencies = useMemo(() => {
    if (!schemaQuery.data || !currencies) {
      return schemaQuery.data;
    }

    const form = {
      ...schemaQuery.data,
      fields: schemaQuery.data.fields.map((field) => {
        if (field.name !== 'payment_terms') {
          return field;
        }

        return {
          ...field,
          fields: (field.fields as $TSFixMe[])?.map((nestedField: $TSFixMe) => {
            if (nestedField.name !== 'compensation_currency_code') {
              return nestedField;
            }

            // Return a new object with overridden options
            return {
              ...nestedField,
              options: currencies.map((currency) => ({
                label: currency.code,
                value: currency.code,
                meta: { source: currency.source },
              })),
            };
          }),
        };
      }),
    };

    return form;
  }, [schemaQuery.data, currencies]);

  return {
    ...schemaQuery,
    data: dataWithCurrencies as $TSFixMe,
    isLoading: schemaQuery.isLoading || isLoadingCurrencies,
  };
};
