import { ContractorOnboardingFlowProps } from '@/src/flows/ContractorOnboarding/types';
import { STEPS } from '@/src/flows/ContractorOnboarding/utils';
import { useCountriesSchemaField } from '@/src/flows/Onboarding/api';
import { JSONSchemaFormType } from '@/src/flows/types';
import { Step, useStepState } from '@/src/flows/useStepState';
import { JSFFieldset, Meta } from '@/src/types/remoteFlows';
import { Fields } from '@remoteoss/json-schema-form';
import { useMemo, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';

const stepToFormSchemaMap: Record<
  keyof typeof STEPS,
  JSONSchemaFormType | null
> = {
  select_country: null,
  basic_information: 'employment_basic_information',
};

type useContractorOnboardingProps = Omit<
  ContractorOnboardingFlowProps,
  'render'
>;

export const useContractorOnboarding = ({
  countryCode,
  options,
}: useContractorOnboardingProps) => {
  const [internalCountryCode, setInternalCountryCode] = useState<string | null>(
    countryCode || null,
  );
  const fieldsMetaRef = useRef<{
    select_country: Meta;
    basic_information: Meta;
    contract_details: Meta;
    benefits: Meta;
  }>({
    select_country: {},
    basic_information: {},
    contract_details: {},
    benefits: {},
  });

  const stepFieldsWithFlatFieldsets: Record<
    keyof typeof STEPS,
    JSFFieldset | null | undefined
  > = {
    select_country: null,
    // TODO: fix me later
    basic_information: null,
  };
  const {
    fieldValues,
    stepState,
    setFieldValues,
    previousStep,
    nextStep,
    goToStep,
  } = useStepState(
    STEPS as Record<keyof typeof STEPS, Step<keyof typeof STEPS>>,
  );

  const formType =
    stepToFormSchemaMap[stepState.currentStep.name] ||
    'employment_basic_information';

  const { selectCountryForm, isLoading: isLoadingCountries } =
    useCountriesSchemaField({
      jsfModify: options?.jsfModify?.select_country,
      jsonSchemaVersion: options?.jsonSchemaVersion,
      queryOptions: {
        enabled: stepState.currentStep.name === 'select_country',
      },
    });

  const stepFields: Record<keyof typeof STEPS, Fields> = useMemo(
    () => ({
      select_country: selectCountryForm?.fields || [],
      basic_information: [],
    }),
    [selectCountryForm?.fields],
  );

  const goTo = (step: keyof typeof STEPS) => {
    goToStep(step);
  };

  const parseFormValues = (values: FieldValues) => {
    if (selectCountryForm && stepState.currentStep.name === 'select_country') {
      return values;
    }

    return {};
  };

  function onSubmit(values: FieldValues) {
    const parsedValues = parseFormValues(values);
    switch (stepState.currentStep.name) {
      case 'select_country': {
        setInternalCountryCode(parsedValues.country);
        return Promise.resolve({ data: { countryCode: parsedValues.country } });
      }
      default: {
        throw new Error('Invalid step state');
      }
    }
  }

  const isLoading = isLoadingCountries;

  return {
    /**
     * Loading state indicating if the flow is loading data
     */
    isLoading,

    /**
     * Current state of the form fields for the current step.
     */
    fieldValues,

    /**
     * Current step state containing the current step and total number of steps
     */
    stepState,

    /**
     * Function to update the current form field values
     * @param values - New form values to set
     */
    checkFieldUpdates: setFieldValues,

    /**
     * Function to handle going back to the previous step
     * @returns {void}
     */
    back: previousStep,

    /**
     * Function to handle going to the next step
     * @returns {void}
     */
    next: nextStep,

    /**
     * Function to handle going to a specific step
     * @param step The step to go to.
     * @returns {void}
     */
    goTo: goTo,

    /**
     * Function to handle form submission
     * @param values - Form values to submit
     * @returns Promise resolving to the mutation result
     */
    onSubmit,

    /**
     * Array of form fields from the onboarding schema
     */
    fields: stepFields[stepState.currentStep.name],

    /**
     * Fields metadata for each step
     */
    meta: {
      fields: fieldsMetaRef.current,
      fieldsets: stepFieldsWithFlatFieldsets[stepState.currentStep.name],
    },

    /**
     * let's the user know that the employment cannot be edited, happens when employment.status is invited, created_awaiting_reserve or created_reserve_paid
     * @returns {boolean}
     */
    isEmploymentReadOnly: false, // TODO: TBD

    /**
     * Function to parse form values before submission
     * @param values - Form values to parse
     * @returns Parsed form values
     */
    parseFormValues,

    /**
     * Function to validate form values against the onboarding schema
     * @param values - Form values to validate
     * @returns Validation result or null if no schema is available
     */
    handleValidation: (values: FieldValues) => {
      if (stepState.currentStep.name === 'select_country') {
        return selectCountryForm.handleValidation(values);
      }

      return null;
    },
  };
};
