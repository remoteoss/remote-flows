import { useMemo, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { JSFFields } from '@/src/types/remoteFlows';
import {
  getInitialValues,
} from '@/src/components/form/utils';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import { CreateCompanyFlowProps } from '@/src/flows/CreateCompany/types';
import {
  STEPS,
} from '@/src/flows/CreateCompany/utils';
import {
  useCountriesSchemaField,
} from '@/src/flows/Onboarding/api';

import { Step, useStepState } from '@/src/flows/useStepState';
import { createStructuredError, prettifyFormValues } from '@/src/lib/utils';
import { JSFFieldset, Meta } from '@/src/types/remoteFlows';

type useCreateCompanyProps = Omit<
  CreateCompanyFlowProps,
  'render'
>;

export const useCreateCompany = ({
  countryCode,
  options,
}: useCreateCompanyProps) => {
  const [internalCountryCode, setInternalCountryCode] = useState<string | null>(
    countryCode || null,
  );
  const fieldsMetaRef = useRef<{
    select_country: Meta;
    basic_information: Meta;
  }>({
    select_country: {},
    basic_information: {},
  });

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


  const { selectCountryForm, isLoading: isLoadingCountries } =
    useCountriesSchemaField({
      jsfModify: options?.jsfModify?.select_country,
      queryOptions: {
        enabled: stepState.currentStep.name === 'select_country',
      },
    });

  const stepFields: Record<keyof typeof STEPS, JSFFields> = useMemo(
    () => ({
      select_country: selectCountryForm?.fields || [],
      review: [],
    }),
    [
      selectCountryForm?.fields,
    ],
  );

  const stepFieldsWithFlatFieldsets: Record<
    keyof typeof STEPS,
    JSFFieldset | null | undefined
  > = {
    select_country: null,
    review: null
  };


  const selectCountryInitialValues = useMemo(
    () =>
      getInitialValues(stepFields.select_country, {
        country: internalCountryCode || '',
      }),
    [stepFields.select_country, internalCountryCode],
  );


  const initialValues = useMemo(() => {
    return {
      select_country: selectCountryInitialValues,
    };
  }, [
    selectCountryInitialValues,
  ]);

  const goTo = (step: keyof typeof STEPS) => {
    goToStep(step);
  };

  const parseFormValues = async (values: FieldValues) => {
    if (selectCountryForm && stepState.currentStep.name === 'select_country') {
      return values;
    }
    return {};
  };

  async function onSubmit(values: FieldValues) {
    const currentStepName = stepState.currentStep.name;
    if (currentStepName in fieldsMetaRef.current) {
      fieldsMetaRef.current[
        currentStepName as keyof typeof fieldsMetaRef.current
      ] = prettifyFormValues(values, stepFields[currentStepName]);
    }
    const parsedValues = await parseFormValues(values);
    switch (stepState.currentStep.name) {
      case 'select_country': {
        setInternalCountryCode(parsedValues.country);
        return Promise.resolve({ data: { countryCode: parsedValues.country } });
      }

      default: {
        throw createStructuredError('Invalid step state');
      }
    }
  }

  const isLoading =
    isLoadingCountries

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
    handleValidation: async (
      values: FieldValues,
    ): Promise<ValidationResult | null> => {
      if (stepState.currentStep.name === 'select_country') {
        return selectCountryForm.handleValidation(values);
      }

      return null;
    },

    /**
     * Initial form values
     */
    initialValues,
  };
};
