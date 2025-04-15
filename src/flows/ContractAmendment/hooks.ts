import {
  CreateContractAmendmentParams,
  EmploymentShowResponse,
  getShowContractAmendmentSchema,
  getShowEmployment,
  postAutomatableContractAmendment,
  postCreateContractAmendment,
} from '@/src/client';

import { parseJSFToValidate } from '@/src/components/form/utils';
import { mutationToPromise } from '@/src/lib/mutations';

import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ContractAmendmentParams } from './types';

import { useClient } from '@/src/context';
import { FieldValues } from 'react-hook-form';
import { buildInitialValues, STEPS } from './utils';

type UseEmployment = Pick<ContractAmendmentParams, 'employmentId'>;

const useEmploymentQuery = ({ employmentId }: UseEmployment) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['employment'],
    retry: false,
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

const useContractAmendmentSchemaQuery = ({
  countryCode,
  employment,
  fieldValues,
  options,
}: ContractAmendmentSchemaParams) => {
  const { client } = useClient();
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
          employment_id: employment?.data?.employment?.id as string,
          country_code: countryCode,
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
      const copyFieldValues = { ...fieldValues };
      return createHeadlessForm(jsfSchema, {
        initialValues: copyFieldValues || buildInitialValues(employment),
      });
    },
  });
};

const useCreateContractAmendmentMutation = () => {
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

const useAutomatableContractAmendmentMutation = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (payload: CreateContractAmendmentParams) => {
      return postAutomatableContractAmendment({
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
  const [stepState, setStepState] = useState<{
    currentStep: typeof STEPS.AMENDMENT_FORM;
    totalSteps: number;
  }>({
    currentStep: STEPS.AMENDMENT_FORM,
    totalSteps: Object.keys(STEPS).length,
  });
  const [fieldValues, setFieldValues] = useState<FieldValues>({});

  const {
    data: employment,
    isLoading: isLoadingEmployment,
    isError: isErrorEmployment,
    error: errorEmployment,
  } = useEmploymentQuery({
    employmentId,
  });
  const {
    data: contractAmendmentHeadlessForm,
    isLoading: isLoadingContractAmendments,
    isError: isErrorContractAmendmentSchema,
    error: errorContractAmendmentSchema,
  } = useContractAmendmentSchemaQuery({
    employment,
    countryCode,
    fieldValues,
    options,
  });

  const initialValues = buildInitialValues(
    employment,
    contractAmendmentHeadlessForm?.fields,
  );

  const createContractAmendmentMutation = useCreateContractAmendmentMutation();
  const automatableContractAmendmentMutation =
    useAutomatableContractAmendmentMutation();

  async function onSubmit(values: FieldValues) {
    const parsedValues = parseJSFToValidate(
      values,
      contractAmendmentHeadlessForm?.fields || [],
      {
        isPartialValidation: false,
      },
    );

    const payload = {
      employment_id: employment?.data.employment?.id as string,
      amendment_contract_id: employment?.data.employment
        ?.active_contract_id as string,
      contract_amendment: {
        ...parsedValues,
      },
    };

    switch (stepState.currentStep.name) {
      case STEPS.AMENDMENT_FORM.name: {
        const { mutateAsync } = mutationToPromise(
          automatableContractAmendmentMutation,
        );

        const automatableContractAmendment = await mutateAsync(payload);

        setStepState((previousState) => ({
          ...previousState,
          currentStep: STEPS.CONFIRMATION_FORM,
        }));

        return automatableContractAmendment;
      }
      case STEPS.CONFIRMATION_FORM.name: {
        const { mutateAsync } = mutationToPromise(
          createContractAmendmentMutation,
        );

        return mutateAsync(payload);
      }

      default:
        throw new Error('Invalid step state');
    }
  }

  return {
    /**
     * Current step state containing the current step and total number of steps
     */
    stepState,
    /**
     * Array of form fields from the contract amendment schema
     */
    fields: contractAmendmentHeadlessForm?.fields || [],
    /**
     * Loading state indicating if either employment or contract amendment data is being fetched
     */
    isLoading: isLoadingEmployment || isLoadingContractAmendments,
    /**
     * Error state indicating if there was an error fetching either employment or contract amendment data
     */
    isError: isErrorEmployment || isErrorContractAmendmentSchema,
    /**
     * Error object containing details about any errors that occurred during data fetching
     */
    error: errorEmployment || errorContractAmendmentSchema,
    /**
     * Loading state indicating if a contract amendment mutation is in progress
     */
    isSubmitting:
      automatableContractAmendmentMutation.isPending ||
      createContractAmendmentMutation.isPending,
    /**
     * Initial form values built from employment data and contract amendment fields
     */
    initialValues,
    /**
     * Current form field values
     */
    values: fieldValues,
    /**
     * Function to validate form values against the contract amendment schema
     * @param values - Form values to validate
     * @returns Validation result or null if no schema is available
     */
    handleValidation: (values: FieldValues) => {
      if (contractAmendmentHeadlessForm) {
        const parsedValues = parseJSFToValidate(
          values,
          contractAmendmentHeadlessForm?.fields,
        );
        return contractAmendmentHeadlessForm?.handleValidation(parsedValues);
      }
      return null;
    },
    /**
     * Function to update the current form field values
     * @param values - New form values to set
     */
    checkFieldUpdates: (values: FieldValues) => {
      setFieldValues(values);
    },
    /**
     * Function to handle form submission
     * @param values - Form values to submit
     * @returns Promise resolving to the mutation result
     */
    onSubmit,
  };
};
