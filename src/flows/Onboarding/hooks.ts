import {
  EmploymentCreateParams,
  EmploymentFullParams,
  getShowFormCountry,
  patchUpdateEmployment2,
  postCreateEmployment2,
} from '@/src/client';
import { Client } from '@hey-api/client-fetch';
import {
  $TSFixMe,
  createHeadlessForm,
  modify,
} from '@remoteoss/json-schema-form';
import { useState } from 'react';
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
          skip_benefits: true,
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

export const useUpdateOnboarding = () => {
  const { client } = useClient();
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
        },
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
  const [employmentIdState, setEmploymentId] = useState<string | undefined>(
    employmentId,
  );
  const { fieldValues, stepState, setFieldValues, previousStep, nextStep } =
    useStepState<keyof typeof STEPS>(STEPS);

  const createOnboardingMutation = useCreateOnboarding();
  const updateOnboardingMutation = useUpdateOnboarding();
  const { mutateAsync: createOnboardingMutationAsync } = mutationToPromise(
    createOnboardingMutation,
  );
  const { mutateAsync: updateOnboardingMutationAsync } = mutationToPromise(
    updateOnboardingMutation,
  );

  const form: Record<keyof typeof STEPS, JSONSchemaFormType | null> = {
    basic_information: 'employment_basic_information',
    contract_details: 'contract_details',
    benefits: null,
    review: null,
  };

  const getFormValues = () => {
    if (!stepState.values) {
      return fieldValues;
    }
    return {
      ...stepState.values?.[stepState.currentStep.name as keyof typeof STEPS],
      ...fieldValues,
    };
  };

  const formValues = getFormValues();

  const { data: onboardingForm, isLoading: isLoadingOnboarding } =
    useJSONSchemaForm({
      countryCode: countryCode,
      form:
        form[stepState.currentStep.name as keyof typeof STEPS] ||
        'employment_basic_information',
      fieldValues: formValues,
      options: options,
    });

  async function onSubmit(values: FieldValues) {
    switch (stepState.currentStep.name) {
      case 'basic_information': {
        const payload: EmploymentCreateParams = {
          basic_information: values,
          type: type,
          country_code: countryCode,
        };
        try {
          const response = await createOnboardingMutationAsync(payload);
          // @ts-expect-error the types from the response are not matching
          setEmploymentId(response.data?.data?.employment?.id as $TSFixMe);
          return response;
        } catch (error) {
          console.error('Error creating onboarding:', error);
          throw error;
        }
      }

      case 'contract_details': {
        const payload: EmploymentFullParams = {
          contract_details: values,
        };
        return updateOnboardingMutationAsync({
          employmentId: employmentIdState as string,
          ...payload,
        });
      }
    }

    return;
  }

  function back() {
    previousStep();
  }

  function next() {
    nextStep();
  }

  const initialValues = getFormValues();

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
    handleValidation: (values: FieldValues) => {
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
