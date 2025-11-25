import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form-next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';
import {
  CreateContractAmendmentParams,
  Employment,
  getShowContractAmendmentSchema,
  postAutomatableContractAmendment,
  postCreateContractAmendment,
} from '@/src/client';
import { convertToCents } from '@/src/components/form/utils';
import { useClient } from '@/src/context';
import { ContractAmendmentParams } from '@/src/flows/ContractAmendment/types';
import { FlowOptions } from '@/src/flows/types';
import { buildInitialValues } from './utils';

type ContractAmendmentSchemaParams = {
  countryCode: string;
  employment: Employment | undefined;
  fieldValues: FieldValues | undefined;
  options?: ContractAmendmentParams['options'];
};

export const useContractAmendmentSchemaQuery = ({
  countryCode,
  employment,
  fieldValues,
  options,
}: ContractAmendmentSchemaParams) => {
  const { client } = useClient();
  const jsonSchemaQueryParam = options?.jsonSchemaVersion?.contract_amendments
    ? {
        json_schema_version: options.jsonSchemaVersion.contract_amendments,
      }
    : {};
  return useQuery({
    queryKey: ['contract-amendment-schema'],
    retry: false,
    queryFn: async () => {
      const response = await getShowContractAmendmentSchema({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        query: {
          employment_id: employment?.id as string,
          country_code: countryCode,
          ...jsonSchemaQueryParam,
        },
      });

      // If response status is 404 or other error, throw an error to trigger isError
      if (response.error || !response.data) {
        throw new Error('Failed to fetch contract amendment schema');
      }

      return response;
    },
    enabled: Boolean(employment),
    select: ({ data }) => {
      let jsfSchema = data?.data || {};

      if (options && options.jsfModify) {
        const { schema } = modify(jsfSchema, options.jsfModify);
        jsfSchema = schema;
      }

      const copyFieldValues = {
        ...fieldValues,
        annual_gross_salary: fieldValues?.annual_gross_salary
          ? convertToCents(fieldValues?.annual_gross_salary)
          : undefined,
      };

      const hasFieldValues = Object.keys(copyFieldValues).length > 0;

      const result = createHeadlessForm(jsfSchema, {
        initialValues: hasFieldValues
          ? copyFieldValues
          : buildInitialValues(employment),
      });
      return result;
    },
  });
};

export const useCreateContractAmendmentMutation = (options?: FlowOptions) => {
  const { client } = useClient();
  const jsonSchemaQueryParam = options?.jsonSchemaVersion?.contract_amendments
    ? {
        json_schema_version: options.jsonSchemaVersion.contract_amendments,
      }
    : {};
  return useMutation({
    mutationFn: (payload: CreateContractAmendmentParams) => {
      return postCreateContractAmendment({
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

export const useAutomatableContractAmendmentMutation = (
  options?: FlowOptions,
) => {
  const { client } = useClient();
  const jsonSchemaQueryParam = options?.jsonSchemaVersion?.contract_amendments
    ? {
        json_schema_version: options.jsonSchemaVersion.contract_amendments,
      }
    : {};
  return useMutation({
    mutationFn: (payload: CreateContractAmendmentParams) => {
      return postAutomatableContractAmendment({
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
