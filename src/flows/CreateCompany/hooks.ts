import { useMemo, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import {  useQuery } from '@tanstack/react-query';
import { JSFFields } from '@/src/types/remoteFlows';
import { Client } from '@/src/client/client';
import {
  getInitialValues,
} from '@/src/components/form/utils';
import {
  FlowOptions,
} from '@/src/flows/types';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import { CreateCompanyFlowProps } from '@/src/flows/CreateCompany/types';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { useClient } from '@/src/context';
import { selectCountryStepSchema } from '@/src/flows/CreateCompany/json-schemas/selectCountryStep';
import {
  STEPS,
} from '@/src/flows/CreateCompany/utils';
import {
  getSupportedCountry,
} from '@/src/client';

import { Step, useStepState } from '@/src/flows/useStepState';
import { createStructuredError, prettifyFormValues } from '@/src/lib/utils';
import { JSFFieldset, Meta } from '@/src/types/remoteFlows';

type useCreateCompanyProps = Omit<
  CreateCompanyFlowProps,
  'render'
>;

const useCountries = (queryOptions?: { enabled?: boolean }) => {
  const { client } = useClient();
  return useQuery({
    ...queryOptions,
    queryKey: ['countries'],
    retry: false,
    queryFn: async () => {
      const response = await getSupportedCountry({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
      });

      // If response status is 404 or other error, throw an error to trigger isError
      if (response.error || !response.data) {
        throw new Error('Failed to fetch supported countries');
      }

      return response;
    },
    select: ({ data }) => {
      return (
        data?.data
          ?.filter((country) => country.eor_onboarding)
          .map((country) => {
            return {
              label: country.name,
              value: country.code,
            };
          }) || []
      );
    },
  });
};
const useCountriesSchemaField = (
  options?: Omit<FlowOptions, 'jsonSchemaVersion'> & {
    queryOptions?: { enabled?: boolean };
  },
) => {
  const { data: countries, isLoading } = useCountries(options?.queryOptions);

  const selectCountryForm = createHeadlessForm(
    selectCountryStepSchema.data.schema,
    {},
    options,
  );

  if (countries) {
    const countryField = selectCountryForm.fields.find(
      (field) => field.name === 'country_code',
    );
    if (countryField) {
      countryField.options = countries;
    }
  }

  return {
    isLoading,
    selectCountryForm,
  };
};

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
        return Promise.resolve({ data: { countryCode: parsedValues.country_code } });
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
