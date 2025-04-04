import {
  CreateContractAmendmentParams,
  EmploymentShowResponse,
  getShowContractAmendmentSchema,
  getShowEmployment,
  postCreateContractAmendment,
} from '@/src/client';

import { parseJSFToValidate } from '@/src/components/form/utils';
import { mutationToPromise } from '@/src/lib/mutations';
import { useClient } from '@/src/RemoteFlowsProvider';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ContractAmendmentParams } from './types';

import { FieldValues } from 'react-hook-form';
import { buildValidationSchema } from '../utils';

type UseEmployment = Pick<ContractAmendmentParams, 'employmentId'>;

function buildInitialValues(employment?: EmploymentShowResponse) {
  return {
    effective_date: '',
    job_title: employment?.data?.employment?.job_title,
    additional_comments: '',
    ...(employment?.data?.employment?.contract_details || {}),
  };
}

const useEmployment = ({ employmentId }: UseEmployment) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['employment'],
    queryFn: () => {
      return getShowEmployment({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { employment_id: employmentId },
      });
    },
    select: ({ data }) => data,
  });
};

type ContractAmendmentSchemaParams = {
  countryCode: string;
  employment: EmploymentShowResponse | undefined;
  fieldValues: FieldValues | undefined;
  options?: ContractAmendmentParams['options'];
};

const useContractAmendmentSchema = ({
  countryCode,
  employment,
  fieldValues,
  options,
}: ContractAmendmentSchemaParams) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['contract-amendment-schema'],
    queryFn: () => {
      return getShowContractAmendmentSchema({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        query: {
          employment_id: employment?.data?.employment?.id as string,
          country_code: countryCode,
        },
      });
    },
    enabled: Boolean(employment),
    select: ({ data }) => {
      let jsfSchema = data?.data || {};

      if (options && options.jsfModified) {
        const { schema } = modify(jsfSchema, options.jsfModified);
        jsfSchema = schema;
      }

      return createHeadlessForm(jsfSchema, {
        initialValues: fieldValues || buildInitialValues(employment),
      });
    },
  });
};

const useCreateContractAmendment = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (payload: CreateContractAmendmentParams) => {
      return postCreateContractAmendment({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
      });
    },
  });
};

export const useContractAmendment = ({
  employmentId,
  countryCode,
  options,
}: ContractAmendmentParams) => {
  const [fieldValues, setFieldValues] = useState<FieldValues>();
  const { data: employment, isLoading: isLoadingEmployment } = useEmployment({
    employmentId,
  });

  const {
    data: contractAmendmentHeadlessForm,
    isLoading: isLoadingContractAmendments,
  } = useContractAmendmentSchema({
    employment,
    countryCode,
    fieldValues,
    options,
  });

  const createContractAmendment = useCreateContractAmendment();
  const { mutateAsync } = mutationToPromise(createContractAmendment);

  async function onSubmit(values: CreateContractAmendmentParams) {
    // const validation =
    //   jsonSchemaContractAmendmentFields?.handleValidation(values);
    // if (validation?.formErrors && Object.keys(validation?.formErrors)) {
    //   return {
    //     data: null,
    //     error: validation.formErrors,
    //   };
    // }

    return mutateAsync(values);
  }

  return {
    stepState: {
      current: 0,
      total: 1,
      isLastStep: true,
    },
    fields: contractAmendmentHeadlessForm?.fields || [],
    isLoading: isLoadingEmployment || isLoadingContractAmendments,
    isSubmitting: createContractAmendment.isPending,
    initialValues: buildInitialValues(employment),
    validationSchema: buildValidationSchema(
      // @ts-expect-error error
      contractAmendmentHeadlessForm?.fields || [],
    ),
    handleValidation: (values: FieldValues) => {
      if (contractAmendmentHeadlessForm) {
        const parsedValues = parseJSFToValidate(
          values,
          contractAmendmentHeadlessForm?.fields,
          {
            isPartialValidation: false,
          },
        );
        return contractAmendmentHeadlessForm?.handleValidation(parsedValues);
      }
      return null;
    },
    checkFieldUpdates: (values: FieldValues) => {
      if (contractAmendmentHeadlessForm) {
        const parsedValues = parseJSFToValidate(
          values,
          contractAmendmentHeadlessForm?.fields,
          {
            isPartialValidation: false,
          },
        );
        setFieldValues(parsedValues);
      }
    },
    onSubmit,
  };
};
