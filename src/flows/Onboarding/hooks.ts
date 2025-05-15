import {
  Employment,
  EmploymentCreateParams,
  EmploymentFullParams,
  getShowEmployment,
  getShowFormCountry,
  patchUpdateEmployment2,
  postCreateEmployment2,
  postInviteEmploymentInvitation,
  PostInviteEmploymentInvitationData,
  getShowSchema,
  putUpdateBenefitOffer,
  UnifiedEmploymentUpsertBenefitOffersRequest,
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
import { useState } from 'react';

type OnboardingHookProps = OnboardingFlowParams;

const jsonSchemaToEmployment: Partial<
  Record<JSONSchemaFormType, keyof Employment>
> = {
  employment_basic_information: 'basic_information',
  contract_details: 'contract_details',
};

const useEmployment = (employmentId: string | undefined) => {
  const { client } = useClient();

  return useQuery({
    queryKey: ['employment', employmentId],
    retry: false,
    enabled: !!employmentId,
    queryFn: async () => {
      const response = await getShowEmployment({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          employment_id: employmentId as string,
        },
      });

      // If response status is 404 or other error, throw an error to trigger isError
      if (response.error || !response.data) {
        throw new Error('Failed to fetch employment data');
      }

      return response;
    },
  });
};

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
  employment,
}: {
  countryCode: string;
  form: JSONSchemaFormType;
  fieldValues: FieldValues;
  options?: OnboardingHookProps['options'];
  employment?: Employment;
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
      const hasFieldValues = Object.keys(fieldValues).length > 0;
      const employmentField = jsonSchemaToEmployment[form] as keyof Employment;
      const result = createHeadlessForm(schema, {
        initialValues: hasFieldValues
          ? fieldValues
          : (employment?.[employmentField] as Record<string, unknown>),
      });

      return result;
    },
  });
};

const useBenefitOffersSchema = (
  employmentId: string,
  options: OnboardingHookProps['options'],
) => {
  const jsonSchemaQueryParam = options?.jsonSchemaVersion
    ?.benefit_offers_form_schema
    ? {
        json_schema_version:
          options.jsonSchemaVersion.benefit_offers_form_schema,
      }
    : {};
  const { client } = useClient();
  return useQuery({
    queryKey: ['benefit-offers-schema', employmentId],
    retry: false,
    enabled: !!employmentId,
    queryFn: async () => {
      const response = await getShowSchema({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          employment_id: employmentId,
        },
        query: {
          ...jsonSchemaQueryParam,
        },
      });

      // If response status is 404 or other error, throw an error to trigger isError
      if (response.error || !response.data) {
        throw new Error('Failed to fetch benefit offers schema');
      }

      return response;
    },
    select: ({ data }) => {
      const { schema } = modify(
        data.data?.schema || {},
        options?.jsfModify || {},
      );
      const result = createHeadlessForm(schema, {
        initialValues: {},
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

const useUpdateEmployment = () => {
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

const useUpdateBenefitsOffers = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: ({
      employmentId,
      ...payload
    }: UnifiedEmploymentUpsertBenefitOffersRequest & {
      employmentId: string;
    }) => {
      return putUpdateBenefitOffer({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
        path: {
          employment_id: employmentId,
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
  const { data: employment, isLoading: isLoadingEmployment } =
    useEmployment(employmentId);
  const { fieldValues, stepState, setFieldValues, previousStep, nextStep } =
    useStepState<keyof typeof STEPS>(STEPS);

  const createEmploymentMutation = useCreateEmployment();
  const updateEmploymentMutation = useUpdateEmployment();
  const updateBenefitsOffersMutation = useUpdateBenefitsOffers();
  const { mutateAsync: createEmploymentMutationAsync } = mutationToPromise(
    createEmploymentMutation,
  );
  const { mutateAsync: updateEmploymentMutationAsync } = mutationToPromise(
    updateEmploymentMutation,
  );
  const { mutateAsync: updateBenefitsOffersMutationAsync } = mutationToPromise(
    updateBenefitsOffersMutation,
  );

  const form: Record<keyof typeof STEPS, JSONSchemaFormType | null> = {
    basic_information: 'employment_basic_information',
    contract_details: 'contract_details',
    benefits: null,
    review: null,
  };

  const { data: onboardingForm, isLoading: isLoadingBasicInformation } =
    useJSONSchemaForm({
      countryCode: countryCode,
      form:
        form[stepState.currentStep.name as keyof typeof STEPS] ||
        'employment_basic_information',
      fieldValues: fieldValues,
      options: options,
      employment: employment?.data?.data?.employment,
    });

  const {
    data: benefitOffersSchema,
    isLoading: isLoadingBenefitsOffersSchema,
  } = useBenefitOffersSchema(employmentIdState as string, options);

  async function onSubmit(values: FieldValues) {
    switch (stepState.currentStep.name) {
      case 'basic_information': {
        const payload: EmploymentCreateParams = {
          basic_information: values,
          type: type,
          country_code: countryCode,
        };
        try {
          const response = await createEmploymentMutationAsync(payload);
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
        return updateEmploymentMutationAsync({
          employmentId: employmentIdState as string,
          ...payload,
        });
      }

      case 'benefits': {
        const payload: UnifiedEmploymentUpsertBenefitOffersRequest = {
          benefit_offers: values,
        };
        return updateBenefitsOffersMutationAsync({
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

  const initialValues = {
    basic_information:
      employment?.data?.data.employment?.basic_information || {},
    contract_details: employment?.data?.data.employment?.contract_details || {},
  };

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
    fields: {
      basic_information: onboardingForm?.fields,
      contract_details: onboardingForm?.fields,
      benefits: benefitOffersSchema?.fields,
    },
    /**
     * Loading state indicating if the onboarding schema is being fetched
     */
    isLoading:
      isLoadingBasicInformation ||
      isLoadingEmployment ||
      isLoadingBenefitsOffersSchema,
    /**
     * Loading state indicating if the onboarding mutation is in progress
     */
    isSubmitting:
      createEmploymentMutation.isPending ||
      updateEmploymentMutation.isPending ||
      updateBenefitsOffersMutation.isPending,
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
      if (stepState.currentStep.name === 'benefits' && benefitOffersSchema) {
        const parsedValues = parseJSFToValidate(
          values,
          benefitOffersSchema?.fields,
        );

        return benefitOffersSchema?.handleValidation(parsedValues);
      }
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
     * Function to parse form values before submission
     * @param values - Form values to parse
     * @returns Parsed form values
     */
    parseFormValues: (values: Record<string, unknown>) => {
      if (onboardingForm) {
        return parseJSFToValidate(values, onboardingForm?.fields, {
          isPartialValidation: true,
        });
      }
      return null;
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
