import {
  EmploymentCreateParams,
  getShowFormCountry,
  postCreateEmployment2,
  postInviteEmploymentInvitation,
  PostInviteEmploymentInvitationData,
} from '@/src/client';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from '@/src/context';
import { useStepState } from '@/src/flows/useStepState';
import { STEPS } from '@/src/flows/Onboarding/utils';
import { parseJSFToValidate } from '@/src/components/form/utils';
import { mutationToPromise } from '@/src/lib/mutations';
import { FieldValues } from 'react-hook-form';
import { OnboardingFlowParams } from '@/src/flows/Onboarding/types';
import { JSONSchemaFormType } from '@/src/flows/types';

type OnboardingHookProps = OnboardingFlowParams;

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

/**
 * Use this hook to get the JSON schema form for the onboarding flow
 * @param param0
 * @returns
 */
const useJSONSchemaForm = ({
  countryCode,
  form,
  fieldValues,
  options,
}: {
  countryCode: string;
  form: JSONSchemaFormType;
  fieldValues: FieldValues;
  options?: OnboardingHookProps['options'];
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
          ...jsonSchemaQueryParam,
        },
      });

      // If response status is 404 or other error, throw an error to trigger isError
      if (response.error || !response.data) {
        throw new Error('Failed to fetch onboarding schema');
      }

      return response;
    },
    select: ({ data }) => {
      const { schema } = modify(data.data || {}, options?.jsfModify || {});
      const result = createHeadlessForm(schema, {
        initialValues: fieldValues,
      });
      return result;
    },
  });
};

/**
 * Use this hook to create an employment
 * @returns
 */
const useCreateEmployment = () => {
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

export const useOnboarding = ({
  employmentId,
  countryCode,
  type,
  options,
}: OnboardingHookProps) => {
  const { fieldValues, stepState, setFieldValues, previousStep, nextStep } =
    useStepState<keyof typeof STEPS>(STEPS);

  const createEmploymentMutation = useCreateEmployment();
  const { mutateAsync: createEmploymentMutationAsync } = mutationToPromise(
    createEmploymentMutation,
  );

  /* const formValues = {
    ...stepState.values?.[stepState.currentStep.name as keyof typeof STEPS], // Restore values for the current step
    ...fieldValues,
  }; */

  const { data: onboardingForm, isLoading: isLoadingOnboarding } =
    useJSONSchemaForm({
      countryCode: countryCode,
      form: 'employment_basic_information',
      fieldValues: fieldValues,
      options: options,
    });

  async function onSubmit(values: FieldValues) {
    const payload: EmploymentCreateParams = {
      basic_information: values,
      type: type,
      country_code: countryCode,
    };
    return createEmploymentMutationAsync(payload);
  }

  function back() {
    previousStep();
  }

  function next() {
    nextStep();
  }

  const initialValues = {}; /* buildInitialValues({
    ...stepState.values?.employee_communication,
    ...stepState.values?.termination_details,
    ...stepState.values?.paid_time_off,
    ...stepState.values?.additional_information,
  }); */

  return {
    /**
     * Employment id passed useful to be used between components
     */
    employmentId,
    /**
     * Current step state containing the current step and total number of steps
     */
    stepState,
    /**
     * Array of form fields from the onboarding schema
     */
    fields: onboardingForm?.fields || [],
    /**
     * Loading state indicating if the onboarding schema is being fetched
     */
    isLoading: isLoadingOnboarding,
    /**
     * Loading state indicating if the onboarding mutation is in progress
     */
    isSubmitting: createEmploymentMutation.isPending,
    /**
     * Initial form values
     */
    initialValues: initialValues,
    /**
     * Function to validate form values against the onboarding schema
     * @param values - Form values to validate
     * @returns Validation result or null if no schema is available
     */
    handleValidation: (values: FieldValues) => {
      // TODO: we probably we'll need to validate different forms
      if (onboardingForm) {
        const parsedValues = parseJSFToValidate(values, onboardingForm?.fields);

        return onboardingForm?.handleValidation(parsedValues);
      }
      return null;
    },
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

    /**
     * Function to handle going to the next step
     * @returns {void}
     */
    next,
  };
};
