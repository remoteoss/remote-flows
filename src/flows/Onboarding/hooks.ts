import { EmploymentCreateParams, EmploymentFullParams } from '@/src/client';
import { Fields } from '@remoteoss/json-schema-form';

import { useStepState } from '@/src/flows/useStepState';
import { STEPS } from '@/src/flows/Onboarding/utils';
import {
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { mutationToPromise } from '@/src/lib/mutations';
import { FieldValues } from 'react-hook-form';
import { OnboardingFlowParams } from '@/src/flows/Onboarding/types';
import { JSONSchemaFormType } from '@/src/flows/types';
import { useState } from 'react';
import mergeWith from 'lodash/mergeWith';
import {
  useBenefitOffers,
  useBenefitOffersSchema,
  useCompany,
  useCreateEmployment,
  useEmployment,
  useJSONSchemaForm,
  useUpdateBenefitsOffers,
  useUpdateEmployment,
} from '@/src/flows/Onboarding/api';

type OnboardingHookProps = OnboardingFlowParams;

export const useOnboarding = ({
  employmentId,
  companyId,
  countryCode,
  type,
  options,
}: OnboardingHookProps) => {
  const [internalEmploymentId, setInternalEmploymentId] = useState<
    string | undefined
  >(employmentId);
  const { data: employment, isLoading: isLoadingEmployment } =
    useEmployment(employmentId);

  const { data: benefitOffers, isLoading: isLoadingBenefitOffers } =
    useBenefitOffers(internalEmploymentId);
  const { data: company, isLoading: isLoadingCompany } = useCompany(companyId);
  const {
    fieldValues,
    stepState,
    setFieldValues,
    previousStep,
    nextStep,
    goToStep,
  } = useStepState<keyof typeof STEPS>(STEPS);

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
      fieldValues: {
        ...stepState.values?.[stepState.currentStep.name as keyof typeof STEPS], // Restore values for the current step
        ...fieldValues,
      },
      options: options,
      employment: employment?.data?.data?.employment,
    });

  const benefitsFormValues = {
    ...stepState.values?.[stepState.currentStep.name as keyof typeof STEPS], // Restore values for the current step
    ...fieldValues,
  };

  const initialValuesBenefitOffers =
    stepState.currentStep.name === 'benefits'
      ? mergeWith({}, benefitOffers, benefitsFormValues)
      : {};

  const {
    data: benefitOffersSchema,
    isLoading: isLoadingBenefitsOffersSchema,
  } = useBenefitOffersSchema(
    internalEmploymentId as string,
    fieldValues,
    options,
  );

  const stepFields: Record<keyof typeof STEPS, Fields> = {
    basic_information: onboardingForm?.fields || [],
    contract_details: onboardingForm?.fields || [],
    benefits: benefitOffersSchema?.fields || [],
    review: [],
  };

  const initialValues = {
    basic_information: getInitialValues(
      stepFields[stepState.currentStep.name as keyof typeof stepFields],
      employment?.data?.data.employment?.basic_information || {},
    ),
    contract_details: getInitialValues(
      stepFields[stepState.currentStep.name as keyof typeof stepFields],
      employment?.data?.data.employment?.contract_details || {},
    ),
    benefits: initialValuesBenefitOffers || {},
  };

  function parseFormValues(values: FieldValues) {
    if (onboardingForm) {
      return parseJSFToValidate(values, onboardingForm?.fields, {
        isPartialValidation: true,
      });
    }
    return {};
  }

  async function onSubmit(values: FieldValues) {
    const parsedValues = parseFormValues(values);
    switch (stepState.currentStep.name) {
      case 'basic_information': {
        if (!internalEmploymentId) {
          const payload: EmploymentCreateParams = {
            basic_information: parsedValues,
            type: type,
            country_code: countryCode,
          };
          try {
            const response = await createEmploymentMutationAsync(payload);
            setInternalEmploymentId(
              // @ts-expect-error the types from the response are not matching
              response.data?.data?.employment?.id,
            );
            return response;
          } catch (error) {
            console.error('Error creating onboarding:', error);
            throw error;
          }
        } else {
          return updateEmploymentMutationAsync({
            employmentId: internalEmploymentId,
            basic_information: parsedValues,
            pricing_plan_details: {
              frequency: 'monthly',
            },
          });
        }
      }

      case 'contract_details': {
        const payload: EmploymentFullParams = {
          contract_details: parsedValues,
        };
        return updateEmploymentMutationAsync({
          employmentId: internalEmploymentId as string,
          ...payload,
        });
      }

      case 'benefits': {
        return updateBenefitsOffersMutationAsync({
          employmentId: internalEmploymentId as string,
          ...values,
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

  function goTo(step: keyof typeof STEPS) {
    goToStep(step);
  }

  return {
    /**
     * Employment id passed useful to be used between components
     */
    employmentId,

    /**
     * Credit risk status of the company, useful to know what to to show in the review step
     * The possible values are:
     * - not_started
     * - ready
     * - in_progress
     * - referred
     * - fail
     * - deposit_required
     * - no_deposit_required
     */

    creditRiskStatus: company?.default_legal_entity_credit_risk_status,
    /**
     * Current step state containing the current step and total number of steps
     */
    stepState,
    /**
     * Array of form fields from the onboarding schema
     */
    fields: stepFields[stepState.currentStep.name as keyof typeof stepFields],
    /**
     * Loading state indicating if the onboarding schema is being fetched
     */
    isLoading:
      isLoadingBasicInformation ||
      isLoadingEmployment ||
      isLoadingBenefitsOffersSchema ||
      isLoadingBenefitOffers ||
      isLoadingCompany,
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
    initialValues,
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
    parseFormValues,

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

    /**
     * Function to handle going to a specific step
     * @param step The step to go to.
     * @returns {void}
     */
    goTo,
  };
};
