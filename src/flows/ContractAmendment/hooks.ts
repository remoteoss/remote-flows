import {
  CreateContractAmendmentParams,
  Employment,
  getShowContractAmendmentSchema,
  postAutomatableContractAmendment,
  postCreateContractAmendment,
} from '@/src/client';

import {
  convertToCents,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { mutationToPromise } from '@/src/lib/mutations';

import { Client } from '@/src/client';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ContractAmendmentParams } from './types';

import { useEmploymentQuery } from '@/src/common/api';
import { useClient } from '@/src/context';
import { FieldValues } from 'react-hook-form';
import { useStepState } from '../useStepState';
import { buildInitialValues, STEPS } from './utils';
import { FlowOptions } from '@/src/flows/types';

type ContractAmendmentSchemaParams = {
  countryCode: string;
  employment: Employment | undefined;
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

const useCreateContractAmendmentMutation = (options?: FlowOptions) => {
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

const useAutomatableContractAmendmentMutation = (options?: FlowOptions) => {
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

export const useContractAmendment = ({
  employmentId,
  countryCode,
  options,
}: ContractAmendmentParams) => {
  const { fieldValues, setFieldValues, stepState, nextStep, previousStep } =
    useStepState<keyof typeof STEPS>(STEPS);

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
    // In case the user is navigating back to the form step, we need to
    // pass the previous field values, so that the schema can be
    // generated with the correct values.
    fieldValues: {
      ...stepState.values?.[stepState.currentStep.name], // Restore values for the current step
      ...fieldValues,
    },
    options,
  });

  const initialValues = buildInitialValues(
    employment,
    contractAmendmentHeadlessForm?.fields,
  );

  const createContractAmendmentMutation =
    useCreateContractAmendmentMutation(options);
  const automatableContractAmendmentMutation =
    useAutomatableContractAmendmentMutation(options);

  async function onSubmit(values: FieldValues) {
    const parsedValues = await parseJSFToValidate(
      values,
      contractAmendmentHeadlessForm?.fields || [],
      {
        isPartialValidation: false,
      },
    );

    const payload = {
      employment_id: employment?.id as string,
      amendment_contract_id: employment?.active_contract_id as string,
      contract_amendment: {
        ...parsedValues,
      },
    };

    switch (stepState.currentStep.name) {
      case STEPS.form.name: {
        const { mutateAsync } = mutationToPromise(
          automatableContractAmendmentMutation,
        );

        const automatableContractAmendment = await mutateAsync(payload);

        nextStep();

        return automatableContractAmendment;
      }
      case STEPS.confirmation_form.name: {
        const { mutateAsync } = mutationToPromise(
          createContractAmendmentMutation,
        );

        return mutateAsync(payload);
      }

      default:
        throw new Error('Invalid step state');
    }
  }

  async function handleValidation(values: FieldValues) {
    if (contractAmendmentHeadlessForm) {
      const parsedValues = await parseJSFToValidate(
        values,
        contractAmendmentHeadlessForm?.fields,
      );

      return contractAmendmentHeadlessForm?.handleValidation(parsedValues);
    }
    return null;
  }

  function back() {
    previousStep();
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
    handleValidation,
    /**
     * Function to update the current form field values
     * @param values - New form values to set
     */
    checkFieldUpdates: setFieldValues,
    /**
     * Function to handle form submission
     * @param values - Form values to submit
     * @returns Promise resolving to the mutation result
     */
    onSubmit,
    /**
     * Function to handle going back to the previous step
     * @returns {void}
     */
    back,
  };
};
