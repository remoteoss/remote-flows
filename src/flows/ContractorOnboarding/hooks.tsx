import {
  CreateContractDocument,
  Employment,
  EmploymentCreateParams,
} from '@/src/client/types.gen';
import {
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import {
  useContractorOnboardingDetailsSchema,
  useCreateContractorContractDocument,
  useGetContractDocumentSignatureSchema,
  useGetShowContractDocument,
  useSignContractDocument,
} from '@/src/flows/ContractorOnboarding/api';
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
} from '@/src/flows/Onboarding/api';
import { FlowOptions, JSFModify, JSONSchemaFormType } from '@/src/flows/types';
import { Step, useStepState } from '@/src/flows/useStepState';
import { mutationToPromise } from '@/src/lib/mutations';
import { prettifyFormValues } from '@/src/lib/utils';
import { $TSFixMe, JSFFieldset, Meta } from '@/src/types/remoteFlows';
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
  contract_details: null,
  pricing_plan: null,
  contract_preview: null,
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
  const [internalContractDocumentId, setInternalContractDocumentId] = useState<
    string | undefined
  >(undefined);
  const fieldsMetaRef = useRef<{
    select_country: Meta;
    basic_information: Meta;
    contract_details: Meta;
    contract_preview: Meta;
    pricing_plan: Meta;
  }>({
    select_country: {},
    basic_information: {},
    contract_details: {},
    contract_preview: {},
    pricing_plan: {},
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
  const createContractorContractDocumentMutation =
    useCreateContractorContractDocument();
  const signContractDocumentMutation = useSignContractDocument();

  const { mutateAsync: createEmploymentMutationAsync } = mutationToPromise(
    createEmploymentMutation,
  );

  const { mutateAsync: createContractorContractDocumentMutationAsync } =
    mutationToPromise(createContractorContractDocumentMutation);

  const { mutateAsync: signContractDocumentMutationAsync } = mutationToPromise(
    signContractDocumentMutation,
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
      jsonSchemaVersion?: FlowOptions['jsonSchemaVersion'];
    };
    query?: Record<string, string>;
  }) => {
    const hasUserEnteredAnyValues = Object.keys(fieldValues).length > 0;
    // when you write on the fields, the values are stored in the fieldValues state
    // when values are stored in the stepState is when the user has navigated to the step
    // and then we have the values from the server and the onboardingInitialValues that the user can inject,
    const mergedFormValues = hasUserEnteredAnyValues
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
      fieldValues: mergedFormValues,
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

  const isContractorOnboardingDetailsEnabled = Boolean(
    internalCountryCode && stepState.currentStep.name === 'contract_details',
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
      jsonSchemaVersion: options?.jsonSchemaVersion,
    },
  });

  const {
    data: contractorOnboardingDetailsForm,
    isLoading: isLoadingContractorOnboardingDetailsForm,
  } = useContractorOnboardingDetailsSchema({
    countryCode: internalCountryCode as string,
    fieldValues: fieldValues,
    options: {
      queryOptions: {
        enabled: isContractorOnboardingDetailsEnabled,
      },
      jsfModify: options?.jsfModify?.contract_details,
      jsonSchemaVersion: options?.jsonSchemaVersion,
    },
  });

  const { data: signatureSchemaForm } = useGetContractDocumentSignatureSchema({
    fieldValues: fieldValues,
    options: {
      queryOptions: {
        enabled: stepState.currentStep.name === 'contract_preview',
      },
    },
  });
  const { data: documentPreviewPdf, isLoading: isLoadingDocumentPreviewForm } =
    useGetShowContractDocument({
      employmentId: internalEmploymentId as string,
      contractDocumentId: internalContractDocumentId as string,
      options: {
        queryOptions: {
          enabled: Boolean(internalContractDocumentId),
        },
      },
    });

  const stepFields: Record<keyof typeof STEPS, Fields> = useMemo(
    () => ({
      select_country: selectCountryForm?.fields || [],
      basic_information: basicInformationForm?.fields || [],
      pricing_plan: [],
      contract_details: contractorOnboardingDetailsForm?.fields || [],
      contract_preview: signatureSchemaForm?.fields || [],
    }),
    [
      selectCountryForm?.fields,
      basicInformationForm?.fields,
      contractorOnboardingDetailsForm?.fields,
      signatureSchemaForm?.fields,
    ],
  );

  const stepFieldsWithFlatFieldsets: Record<
    keyof typeof STEPS,
    JSFFieldset | null | undefined
  > = {
    select_country: null,
    basic_information: basicInformationForm?.meta['x-jsf-fieldsets'],
    pricing_plan: null,
    contract_details: contractorOnboardingDetailsForm?.meta['x-jsf-fieldsets'],
    contract_preview: null,
  };

  const {
    country,
    basic_information: employmentBasicInformation = {},
    contract_details: employmentContractDetails = {},
  } = employment || {};

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

  const contractDetailsInitialValues = useMemo(() => {
    const initialValues = {
      ...onboardingInitialValues,
      ...employmentContractDetails,
    };

    return getInitialValues(stepFields.contract_details, initialValues);
  }, [
    stepFields.contract_details,
    employmentContractDetails,
    onboardingInitialValues,
  ]);

  const contractPreviewInitialValues = useMemo(() => {
    // TODO: TBD not sure if contract preview needs to be populated with anything
    const initialValues = {
      ...onboardingInitialValues,
      ...employmentContractDetails,
    };

    return getInitialValues(stepFields.contract_preview, initialValues);
  }, [
    stepFields.contract_preview,
    employmentContractDetails,
    onboardingInitialValues,
  ]);

  const initialValues = useMemo(() => {
    return {
      select_country: selectCountryInitialValues,
      basic_information: basicInformationInitialValues,
      contract_details: contractDetailsInitialValues,
      contract_preview: contractPreviewInitialValues,
      pricing_plan: {},
    };
  }, [
    selectCountryInitialValues,
    basicInformationInitialValues,
    contractDetailsInitialValues,
    contractPreviewInitialValues,
  ]);

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

    if (
      contractorOnboardingDetailsForm &&
      stepState.currentStep.name === 'contract_details'
    ) {
      return parseJSFToValidate(
        values,
        contractorOnboardingDetailsForm?.fields,
        {
          isPartialValidation: false,
        },
      );
    }

    if (
      signatureSchemaForm &&
      stepState.currentStep.name === 'contract_preview'
    ) {
      return parseJSFToValidate(values, signatureSchemaForm?.fields, {
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
      case 'contract_details': {
        const payload: CreateContractDocument = {
          contract_document: parsedValues,
        };
        const response: $TSFixMe =
          await createContractorContractDocumentMutationAsync({
            employmentId: internalEmploymentId as string,
            payload,
          });

        const contractDocumentId = response.data?.data?.contract_document?.id;
        setInternalContractDocumentId(contractDocumentId);
        return response;
      }

      case 'contract_preview': {
        return signContractDocumentMutationAsync({
          employmentId: internalEmploymentId as string,
          contractDocumentId: internalContractDocumentId as string,
          payload: {
            signature: values.signature,
          },
        });
      }
      default: {
        throw new Error('Invalid step state');
      }
    }
  }

  const isLoading =
    isLoadingCountries ||
    isLoadingBasicInformationForm ||
    isLoadingEmployment ||
    isLoadingContractorOnboardingDetailsForm ||
    isLoadingDocumentPreviewForm;

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

      if (
        contractorOnboardingDetailsForm &&
        stepState.currentStep.name === 'contract_details'
      ) {
        const parsedValues = parseJSFToValidate(
          values,
          contractorOnboardingDetailsForm?.fields,
          { isPartialValidation: false },
        );
        return contractorOnboardingDetailsForm?.handleValidation(parsedValues);
      }

      if (
        signatureSchemaForm &&
        stepState.currentStep.name === 'contract_preview'
      ) {
        const parsedValues = parseJSFToValidate(
          values,
          signatureSchemaForm?.fields,
          { isPartialValidation: false },
        );
        return signatureSchemaForm?.handleValidation(parsedValues);
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
      createEmploymentMutation.isPending ||
      createContractorContractDocumentMutation.isPending ||
      signContractDocumentMutation.isPending,

    /**
     * Document preview PDF data
     */
    documentPreviewPdf,
  };
};
