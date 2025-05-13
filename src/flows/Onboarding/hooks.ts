import {
  EmploymentCreateParams,
  getShowFormCountry,
  postCreateEmployment2,
} from '@/src/client';
import { Client } from '@hey-api/client-fetch';
import { $TSFixMe, createHeadlessForm } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { JSFModify } from '@/src/flows/CostCalculator/types';
import { useClient } from '@/src/context';
import { useStepState } from '@/src/flows/useStepState';
import { STEPS } from '@/src/flows/Onboarding/utils';
import { parseJSFToValidate } from '@/src/components/form/utils';
import { mutationToPromise } from '@/src/lib/mutations';
import { FieldValues } from 'react-hook-form';

type OnboardingHookProps = {
  employmentId?: string;
  countryCode: string;
  type?: EmploymentCreateParams['type'];
  options?: {
    jsfModify?: JSFModify;
  };
};

const useJSONSchemaForm = ({
  countryCode,
  form,
  fieldValues,
}: {
  countryCode: string;
  form: string;
  fieldValues: FieldValues;
}) => {
  const { client } = useClient();

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
      });

      // If response status is 404 or other error, throw an error to trigger isError
      if (response.error || !response.data) {
        throw new Error('Failed to fetch onboarding schema');
      }

      return response;
    },
    select: ({ data }) => {
      const result = createHeadlessForm(data?.data || {}, {
        initialValues: fieldValues,
      });
      return result;
    },
  });
};

const useCreateOnboarding = () => {
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
}: OnboardingHookProps) => {
  const { fieldValues, stepState, setFieldValues, previousStep, nextStep } =
    useStepState<keyof typeof STEPS>(STEPS);

  const createOnboardingMutation = useCreateOnboarding();
  const { mutateAsync: createOnboardingMutationAsync } = mutationToPromise(
    createOnboardingMutation,
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
    });

  async function onSubmit(values: Record<string, unknown>) {
    const payload: EmploymentCreateParams = {
      basic_information: values,
      type: type,
      country_code: countryCode,
    };
    return createOnboardingMutationAsync(payload);
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
    isSubmitting: createOnboardingMutation.isPending,
    /**
     * Initial form values
     */
    initialValues: initialValues,
    /**
     * Function to validate form values against the onboarding schema
     * @param values - Form values to validate
     * @returns Validation result or null if no schema is available
     */
    handleValidation: (values: $TSFixMe) => {
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
