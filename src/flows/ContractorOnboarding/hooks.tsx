import { Employment, EmploymentCreateParams } from '@/src/client/types.gen';
import {
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { ContractorOnboardingFlowProps } from '@/src/flows/ContractorOnboarding/types';
import {
  STEPS,
  STEPS_WITHOUT_SELECT_COUNTRY,
} from '@/src/flows/ContractorOnboarding/utils';
import {
  useCountriesSchemaField,
  useCreateEmployment,
  useEmployment,
  useJSONSchemaForm,
  useUpdateEmployment,
} from '@/src/flows/Onboarding/api';
import { JSFModify, JSONSchemaFormType } from '@/src/flows/types';
import { Step, useStepState } from '@/src/flows/useStepState';
import { mutationToPromise } from '@/src/lib/mutations';
import { prettifyFormValues } from '@/src/lib/utils';
import { JSFFieldset, Meta } from '@/src/types/remoteFlows';
import { Fields } from '@remoteoss/json-schema-form';
import { useMemo, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';

type useContractorOnboardingProps = Omit<
  ContractorOnboardingFlowProps,
  'render'
>;

const stepToFormSchemaMap: Record<
  keyof typeof STEPS,
  JSONSchemaFormType | null
> = {
  select_country: null,
  basic_information: 'employment_basic_information',
  pricing_plan: null,
  contract_options: null,
};

const jsonSchemaToEmployment: Partial<
  Record<JSONSchemaFormType, keyof Employment>
> = {
  employment_basic_information: 'basic_information',
};

export const useContractorOnboarding = ({
  countryCode,
  externalId,
  employmentId,
  skipSteps,
  options,
  initialValues: onboardingInitialValues,
}: useContractorOnboardingProps) => {
  const [internalCountryCode, setInternalCountryCode] = useState<string | null>(
    countryCode || null,
  );
  const [internalEmploymentId, setInternalEmploymentId] = useState<
    string | undefined
  >(employmentId);
  const fieldsMetaRef = useRef<{
    select_country: Meta;
    basic_information: Meta;
    pricing_plan: Meta;
    contract_options: Meta;
  }>({
    select_country: {},
    basic_information: {},
    pricing_plan: {},
    contract_options: {},
  });

  const stepsToUse = skipSteps?.includes('select_country')
    ? STEPS_WITHOUT_SELECT_COUNTRY
    : STEPS;

  const {
    fieldValues,
    stepState,
    setFieldValues,
    previousStep,
    nextStep,
    goToStep,
  } = useStepState(
    stepsToUse as Record<keyof typeof STEPS, Step<keyof typeof STEPS>>,
  );

  const { data: employment, isLoading: isLoadingEmployment } =
    useEmployment(internalEmploymentId);

  const createEmploymentMutation = useCreateEmployment(options);

  const { mutateAsync: createEmploymentMutationAsync } = mutationToPromise(
    createEmploymentMutation,
  );

  // if the employment is loaded, country code has not been set yet
  // we set the internal country code with the employment country code
  if (
    employment?.country?.code &&
    internalCountryCode !== employment.country.code
  ) {
    setInternalCountryCode(employment.country.code);
  }

  const { selectCountryForm, isLoading: isLoadingCountries } =
    useCountriesSchemaField({
      jsfModify: options?.jsfModify?.select_country,
      jsonSchemaVersion: options?.jsonSchemaVersion,
      queryOptions: {
        enabled: stepState.currentStep.name === 'select_country',
      },
    });

  const formType =
    stepToFormSchemaMap[stepState.currentStep.name] ||
    'employment_basic_information';
  const employmentKey = jsonSchemaToEmployment[formType] as keyof Employment;
  const serverEmploymentData = (employment?.[employmentKey] || {}) as Record<
    string,
    unknown
  >;

  const useJSONSchema = ({
    form,
    options: jsonSchemaOptions = {},
    query = {},
  }: {
    form: JSONSchemaFormType;
    options?: {
      jsfModify?: JSFModify;
      queryOptions?: { enabled?: boolean };
    };
    query?: Record<string, string>;
  }) => {
    // when you write on the fields, the values are stored in the fieldValues state
    // when values are stored in the stepState is when the user has navigated to the step
    // and then we have the values from the server and the onboardingInitialValues that the user can inject,
    const memoizedFieldValues =
      Object.keys(fieldValues).length > 0
        ? {
            ...onboardingInitialValues,
            ...stepState.values?.[stepState.currentStep.name], // Restore values for the current step
            ...fieldValues,
          }
        : {
            ...onboardingInitialValues,
            ...serverEmploymentData,
          };

    return useJSONSchemaForm({
      countryCode: internalCountryCode as string,
      form: form,
      fieldValues: memoizedFieldValues,
      query,
      options: {
        ...jsonSchemaOptions,
        queryOptions: {
          enabled: jsonSchemaOptions.queryOptions?.enabled ?? true,
        },
      },
    });
  };

  const isBasicInformationDetailsEnabled = Boolean(
    internalCountryCode && stepState.currentStep.name === 'basic_information',
  );

  const {
    data: basicInformationForm,
    isLoading: isLoadingBasicInformationForm,
  } = useJSONSchema({
    form: 'employment_basic_information',
    options: {
      jsfModify: options?.jsfModify?.basic_information,
      queryOptions: {
        enabled: isBasicInformationDetailsEnabled,
      },
    },
  });

  const stepFields: Record<keyof typeof STEPS, Fields> = useMemo(
    () => ({
      select_country: selectCountryForm?.fields || [],
      basic_information: basicInformationForm?.fields || [],
      pricing_plan: [],
      contract_options: [],
    }),
    [selectCountryForm?.fields, basicInformationForm?.fields],
  );

  const stepFieldsWithFlatFieldsets: Record<
    keyof typeof STEPS,
    JSFFieldset | null | undefined
  > = {
    select_country: null,
    basic_information: basicInformationForm?.meta['x-jsf-fieldsets'],
    pricing_plan: null,
    contract_options: null,
  };

  const { country, basic_information: employmentBasicInformation = {} } =
    employment || {};

  const employmentCountryCode = country?.code;

  const selectCountryInitialValues = useMemo(
    () =>
      getInitialValues(stepFields.select_country, {
        country: internalCountryCode || employmentCountryCode || '',
      }),
    [stepFields.select_country, internalCountryCode, employmentCountryCode],
  );

  const basicInformationInitialValues = useMemo(() => {
    const initialValues = {
      ...onboardingInitialValues,
      ...employmentBasicInformation,
    };

    return getInitialValues(stepFields.basic_information, initialValues);
  }, [
    stepFields.basic_information,
    employmentBasicInformation,
    onboardingInitialValues,
  ]);

  const initialValues = useMemo(() => {
    return {
      select_country: selectCountryInitialValues,
      basic_information: basicInformationInitialValues,
      pricing_plan: {},
      contract_options: {},
    };
  }, [selectCountryInitialValues, basicInformationInitialValues]);

  const goTo = (step: keyof typeof STEPS) => {
    goToStep(step);
  };

  const parseFormValues = (values: FieldValues) => {
    if (selectCountryForm && stepState.currentStep.name === 'select_country') {
      return values;
    }

    if (
      basicInformationForm &&
      stepState.currentStep.name === 'basic_information'
    ) {
      return parseJSFToValidate(values, basicInformationForm?.fields, {
        isPartialValidation: false,
      });
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
    const parsedValues = parseFormValues(values);
    switch (stepState.currentStep.name) {
      case 'select_country': {
        setInternalCountryCode(parsedValues.country);
        return Promise.resolve({ data: { countryCode: parsedValues.country } });
      }
      case 'basic_information': {
        const isEmploymentNotLoaded =
          !internalEmploymentId && internalCountryCode;
        const hasChangedCountry =
          internalEmploymentId &&
          internalCountryCode &&
          employment?.country &&
          employment?.country.code !== internalCountryCode;
        if (isEmploymentNotLoaded || hasChangedCountry) {
          const payload: EmploymentCreateParams = {
            basic_information: parsedValues,
            type: 'contractor',
            country_code: internalCountryCode,
            external_id: externalId,
          };
          try {
            const response = await createEmploymentMutationAsync(payload);
            // @ts-expect-error the types from the response are not matching
            const employmentId = response.data?.data?.employment?.id;
            setInternalEmploymentId(employmentId);

            return response;
          } catch (error) {
            console.error('Error creating onboarding:', error);
            throw error;
          }
        } else if (internalEmploymentId) {
          // TODO: Provisional it seems you cannot update a contractor employment
          return Promise.resolve({
            data: { employmentId: internalEmploymentId },
          });
        }

        return;
      }
      default: {
        throw new Error('Invalid step state');
      }
    }
  }

  const isLoading =
    isLoadingCountries || isLoadingBasicInformationForm || isLoadingEmployment;

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

      if (
        basicInformationForm &&
        stepState.currentStep.name === 'basic_information'
      ) {
        const parsedValues = parseJSFToValidate(
          values,
          basicInformationForm?.fields,
          { isPartialValidation: false },
        );
        return basicInformationForm?.handleValidation(parsedValues);
      }

      return null;
    },

    /**
     * Initial form values
     */
    initialValues,

    /**
     * Employment id
     */
    employmentId: internalEmploymentId,

    /**
     * Loading state indicating if the onboarding mutation is in progress
     */
    isSubmitting:
      createEmploymentMutation.isPending || updateEmploymentMutation.isPending,
  };
};
