import { getShowFormCountry } from '@/src/client';
import { Client } from '@hey-api/client-fetch';
import { $TSFixMe, createHeadlessForm } from '@remoteoss/json-schema-form';
import { useQuery } from '@tanstack/react-query';
import { JSFModify } from '@/src/flows/CostCalculator/types';
import { useClient } from '@/src/context';
import { useStepState } from '@/src/flows/useStepState';
import { STEPS } from '@/src/flows/Onboarding/utils';

type OnboardingHookProps = {
  employmentId?: string;
  countryCode: string;
  options?: {
    jsfModify?: JSFModify;
  };
};

const useJSONSchemaForm = ({
  countryCode,
  form,
  formValues,
}: {
  countryCode: string;
  form: string;
  formValues: Partial<$TSFixMe>;
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
        initialValues: formValues,
      });
      return result;
    },
  });
};

export const useOnboarding = ({
  employmentId,
  countryCode,
}: OnboardingHookProps) => {
  const { fieldValues, stepState, setFieldValues, previousStep, nextStep } =
    useStepState<keyof typeof STEPS>(STEPS);

  /* const formValues = {
    ...stepState.values?.[stepState.currentStep.name as keyof typeof STEPS], // Restore values for the current step
    ...fieldValues,
  }; */

  const { data: onboardingForm, isLoading: isLoadingOnboarding } =
    useJSONSchemaForm({
      countryCode: countryCode,
      form: 'employment_basic_information',
      formValues: fieldValues,
    });

  // TODO: TBD
  async function onSubmit() {
    return;
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
    isSubmitting: false, // TODO: TBD
    /**
     * Initial form values
     */
    initialValues: initialValues,
    /**
     * Function to validate form values against the onboarding schema
     * @param values - Form values to validate
     * @returns Validation result or null if no schema is available
     */
    handleValidation: () => {},
    /**
     * Function to update the current form field values
     * @param values - New form values to set
     */
    // TODO: check with seniority field to see that the conditionals work
    checkFieldUpdates: setFieldValues,
    /**
     * Function to parse form values before submission
     * @param values - Form values to parse
     * @returns Parsed form values
     */
    parseFormValues: (values: $TSFixMe) => {
      // TODO: TBD
      return values;
    },
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
