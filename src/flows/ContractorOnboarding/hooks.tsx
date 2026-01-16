import { useEffect, useMemo, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import omit from 'lodash.omit';
import { JSFFields } from '@/src/types/remoteFlows';
import {
  CreateContractDocument,
  Employment,
  EmploymentCreateParams,
} from '@/src/client/types.gen';
import {
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import {
  useContractorOnboardingDetailsSchema,
  useCreateContractorContractDocument,
  useGetContractDocumentSignatureSchema,
  usePostManageContractorSubscriptions,
  useContractorSubscriptionSchemaField,
  useGetShowContractDocument,
  useSignContractDocument,
  useUpdateUKandSaudiFields,
} from '@/src/flows/ContractorOnboarding/api';
import { ContractorOnboardingFlowProps } from '@/src/flows/ContractorOnboarding/types';
import {
  STEPS,
  STEPS_WITHOUT_SELECT_COUNTRY,
  calculateProvisionalStartDateDescription,
} from '@/src/flows/ContractorOnboarding/utils';
import {
  useCountriesSchemaField,
  useCreateEmployment,
  useEmployment,
  useJSONSchemaForm,
  useUpdateEmployment,
} from '@/src/flows/Onboarding/api';
import {
  disabledInviteButtonEmploymentStatus,
  reviewStepAllowedEmploymentStatus,
} from '@/src/flows/Onboarding/utils';
import { FlowOptions, JSFModify, JSONSchemaFormType } from '@/src/flows/types';
import { Step, useStepState } from '@/src/flows/useStepState';
import { mutationToPromise } from '@/src/lib/mutations';
import { prettifyFormValues } from '@/src/lib/utils';
import { JSFFieldset, Meta } from '@/src/types/remoteFlows';
import {
  contractorStandardProductIdentifier,
  contractorPlusProductIdentifier,
  corProductIdentifier,
} from '@/src/flows/ContractorOnboarding/constants';
import {
  buildBasicInformationJsfModify,
  buildContractDetailsJsfModify,
  buildContractPreviewJsfModify,
} from '@/src/flows/ContractorOnboarding/jsfModify';
import { useUploadFile } from '@/src/common/api/files';

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
  review: null,
};

const jsonSchemaToEmployment: Partial<
  Record<JSONSchemaFormType, keyof Employment>
> = {
  employment_basic_information: 'basic_information',
};

const provisionalStartDate = new Date().toISOString().split('T')[0];

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
    setStepValues,
  } = useStepState(
    stepsToUse as Record<keyof typeof STEPS, Step<keyof typeof STEPS>>,
  );

  const {
    data: employment,
    isLoading: isLoadingEmployment,
    refetch: refetchEmployment,
  } = useEmployment(internalEmploymentId);

  const { status: employmentStatus } = employment || {};

  const isEmploymentReadOnly =
    employmentStatus &&
    reviewStepAllowedEmploymentStatus.includes(employmentStatus);

  const canInvite =
    employmentStatus &&
    !disabledInviteButtonEmploymentStatus.includes(employmentStatus);

  const invitedStatus: 'invited' | 'not_invited' = useMemo(() => {
    const isInvited = employmentStatus === 'invited';

    return isInvited ? 'invited' : 'not_invited';
  }, [employmentStatus]);

  const createEmploymentMutation = useCreateEmployment();
  const updateEmploymentMutation = useUpdateEmployment(
    internalCountryCode as string,
    options,
  );
  const createContractorContractDocumentMutation =
    useCreateContractorContractDocument();
  const uploadFileMutation = useUploadFile();
  const { mutateAsync: updateUKandSaudiFieldsMutation } =
    useUpdateUKandSaudiFields(
      createContractorContractDocumentMutation,
      uploadFileMutation,
      fieldValues,
    );

  const { mutateAsyncOrThrow: updateEmploymentMutationAsync } =
    mutationToPromise(updateEmploymentMutation);
  const signContractDocumentMutation = useSignContractDocument();
  const manageContractorSubscriptionMutation =
    usePostManageContractorSubscriptions();

  const { mutateAsyncOrThrow: createEmploymentMutationAsync } =
    mutationToPromise(createEmploymentMutation);

  const { mutateAsyncOrThrow: createContractorContractDocumentMutationAsync } =
    mutationToPromise(createContractorContractDocumentMutation);

  const { mutateAsyncOrThrow: signContractDocumentMutationAsync } =
    mutationToPromise(signContractDocumentMutation);

  const { mutateAsyncOrThrow: manageContractorSubscriptionMutationAsync } =
    mutationToPromise(manageContractorSubscriptionMutation);

  // if the employment is loaded, country code has not been set yet
  // we set the internal country code with the employment country code
  if (employmentId && employment?.country?.code && !internalCountryCode) {
    setInternalCountryCode(employment.country.code);
  }

  const { selectCountryForm, isLoading: isLoadingCountries } =
    useCountriesSchemaField({
      jsfModify: options?.jsfModify?.select_country,
      queryOptions: {
        enabled: stepState.currentStep.name === 'select_country',
      },
    });

  const {
    form: selectContractorSubscriptionForm,
    isLoading: isLoadingContractorSubscriptions,
  } = useContractorSubscriptionSchemaField(internalEmploymentId as string, {
    jsonSchemaVersion: options?.jsonSchemaVersion,
    queryOptions: {
      enabled: stepState.currentStep.name === 'pricing_plan',
    },
  });

  const formType =
    stepToFormSchemaMap[stepState.currentStep.name] ||
    'contractor_basic_information';
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
    internalCountryCode &&
      (stepState.currentStep.name === 'basic_information' ||
        Boolean(employmentId)),
  );

  const isContractorOnboardingDetailsEnabled = Boolean(
    internalCountryCode &&
      (stepState.currentStep.name === 'contract_details' ||
        Boolean(employmentId)),
  );

  const {
    data: basicInformationForm,
    isLoading: isLoadingBasicInformationForm,
  } = useJSONSchema({
    form: 'contractor_basic_information',
    options: {
      jsfModify: buildBasicInformationJsfModify(
        internalCountryCode as string,
        options,
      ),
      queryOptions: {
        enabled: isBasicInformationDetailsEnabled,
      },
    },
  });

  const descriptionProvisionalStartDate = useMemo(() => {
    return calculateProvisionalStartDateDescription(
      employment?.basic_information?.provisional_start_date as string,
      fieldValues?.service_duration?.provisional_start_date as string,
    );
  }, [
    employment?.basic_information?.provisional_start_date,
    fieldValues?.service_duration?.provisional_start_date,
  ]);

  const selectedPricingPlan = useMemo(() => {
    if (!employment?.contractor_type) {
      return undefined;
    }
    const subscriptions = {
      standard: contractorStandardProductIdentifier,
      plus: contractorPlusProductIdentifier,
      cor: corProductIdentifier,
    };
    return (
      subscriptions[
        employment?.contractor_type as keyof typeof subscriptions
      ] || contractorStandardProductIdentifier
    );
  }, [employment]);

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
      jsfModify: buildContractDetailsJsfModify(
        options?.jsfModify?.contract_details,
        descriptionProvisionalStartDate,
        selectedPricingPlan,
        fieldValues,
      ),
    },
  });

  const { data: signatureSchemaForm } = useGetContractDocumentSignatureSchema({
    fieldValues: fieldValues,
    options: {
      queryOptions: {
        enabled: stepState.currentStep.name === 'contract_preview',
      },
      jsfModify: buildContractPreviewJsfModify(options, fieldValues),
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

  const stepFields: Record<keyof typeof STEPS, JSFFields> = useMemo(
    () => ({
      select_country: selectCountryForm?.fields || [],
      basic_information: basicInformationForm?.fields || [],
      pricing_plan: selectContractorSubscriptionForm?.fields || [],
      contract_details: contractorOnboardingDetailsForm?.fields || [],
      contract_preview: signatureSchemaForm?.fields || [],
      review: [],
    }),
    [
      selectCountryForm?.fields,
      basicInformationForm?.fields,
      selectContractorSubscriptionForm?.fields,
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
    review: null,
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
      provisional_start_date: provisionalStartDate,
      ...onboardingInitialValues,
      ...employmentBasicInformation,
      ir35: employment?.contract_details?.ir_35,
      nationality: employment?.contract_details?.nationality, // TODO: check later when saudi works if this works
    };

    return getInitialValues(stepFields.basic_information, initialValues);
  }, [
    stepFields.basic_information,
    employmentBasicInformation,
    onboardingInitialValues,
    employment?.contract_details?.ir_35,
    employment?.contract_details?.nationality,
  ]);

  const contractDetailsInitialValues = useMemo(() => {
    const hardcodedValues = {
      service_duration: {
        provisional_start_date:
          employmentBasicInformation.provisional_start_date,
      },
    };
    const initialValues = {
      ...hardcodedValues,
      ...onboardingInitialValues,
      ...employmentContractDetails,
    };

    return getInitialValues(stepFields.contract_details, initialValues);
  }, [
    stepFields.contract_details,
    employmentContractDetails,
    onboardingInitialValues,
    employmentBasicInformation,
  ]);

  const contractPreviewInitialValues = useMemo(() => {
    // TODO: TBD not sure if contract preview needs to be populated with anything
    const initialValues = {
      ...onboardingInitialValues,
    };

    return getInitialValues(stepFields.contract_preview, initialValues);
  }, [stepFields.contract_preview, onboardingInitialValues]);

  const pricingPlanInitialValues = useMemo(() => {
    const preselectedPricingPlan = {
      subscription: selectedPricingPlan,
    };
    const initialValues = {
      ...preselectedPricingPlan,
      ...onboardingInitialValues,
    };

    return getInitialValues(stepFields.pricing_plan, initialValues);
  }, [stepFields.pricing_plan, onboardingInitialValues, selectedPricingPlan]);

  const initialValues = useMemo(() => {
    return {
      select_country: selectCountryInitialValues,
      basic_information: basicInformationInitialValues,
      contract_details: contractDetailsInitialValues,
      contract_preview: contractPreviewInitialValues,
      pricing_plan: pricingPlanInitialValues,
    };
  }, [
    selectCountryInitialValues,
    basicInformationInitialValues,
    contractDetailsInitialValues,
    contractPreviewInitialValues,
    pricingPlanInitialValues,
  ]);

  const isNavigatingToReview = useMemo(() => {
    const shouldHandleReadOnlyEmployment = Boolean(
      employmentId &&
        isEmploymentReadOnly &&
        stepState.currentStep.name !== 'review',
    );

    return Boolean(
      shouldHandleReadOnlyEmployment &&
        !isLoadingEmployment &&
        stepFields.basic_information.length > 0 &&
        stepFields.contract_details.length > 0,
    );
  }, [
    employmentId,
    isEmploymentReadOnly,
    isLoadingEmployment,
    stepFields.basic_information.length,
    stepFields.contract_details.length,
    stepState.currentStep.name,
  ]);

  useEffect(() => {
    if (isNavigatingToReview) {
      fieldsMetaRef.current = {
        select_country: prettifyFormValues(
          selectCountryInitialValues,
          stepFields.select_country,
        ),
        basic_information: prettifyFormValues(
          basicInformationInitialValues,
          stepFields.basic_information,
        ),
        contract_details: prettifyFormValues(
          contractDetailsInitialValues,
          stepFields.contract_details,
        ),
        // TODO: TBD
        contract_preview: {},
        // TODO: The BE needs to return the pricing plan through an endpoint
        // TODO: First correct pricingPlanInitialValues to make this work
        pricing_plan: prettifyFormValues(
          pricingPlanInitialValues,
          stepFields.pricing_plan,
        ),
      };

      setStepValues({
        select_country: selectCountryInitialValues,
        basic_information: basicInformationInitialValues,
        contract_details: contractDetailsInitialValues,
        contract_preview: {},
        pricing_plan: pricingPlanInitialValues,
        review: {},
      });
      goToStep('review');
    }
  }, [
    isNavigatingToReview,
    goToStep,
    selectCountryInitialValues,
    basicInformationInitialValues,
    contractDetailsInitialValues,
    setStepValues,
    stepFields.select_country,
    stepFields.basic_information,
    stepFields.contract_details,
    stepFields.pricing_plan,
    pricingPlanInitialValues,
  ]);

  const goTo = (step: keyof typeof STEPS) => {
    goToStep(step);
  };

  const parseFormValues = async (values: FieldValues) => {
    if (selectCountryForm && stepState.currentStep.name === 'select_country') {
      return values;
    }

    if (
      basicInformationForm &&
      stepState.currentStep.name === 'basic_information'
    ) {
      return await parseJSFToValidate(values, basicInformationForm?.fields, {
        isPartialValidation: false,
      });
    }

    if (
      contractorOnboardingDetailsForm &&
      stepState.currentStep.name === 'contract_details'
    ) {
      return await parseJSFToValidate(
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
      return await parseJSFToValidate(values, signatureSchemaForm?.fields, {
        isPartialValidation: false,
      });
    }

    if (
      selectContractorSubscriptionForm &&
      stepState.currentStep.name === 'pricing_plan'
    ) {
      return await parseJSFToValidate(
        values,
        selectContractorSubscriptionForm?.fields,
        {
          isPartialValidation: false,
        },
      );
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
      case 'basic_information': {
        const isEmploymentNotLoaded =
          !internalEmploymentId && internalCountryCode;
        const hasChangedCountry =
          internalEmploymentId &&
          internalCountryCode &&
          employment?.country &&
          employment?.country.code !== internalCountryCode;

        console.log('isEmploymentNotLoaded', isEmploymentNotLoaded);
        console.log('hasChangedCountry', hasChangedCountry);

        if (isEmploymentNotLoaded || hasChangedCountry) {
          const basicInformationParsedValues = omit(
            parsedValues,
            'saudi_nationality_status',
            'ir35',
            'ir35_sds_file',
          );
          const basicInformationPayload: EmploymentCreateParams = {
            basic_information: basicInformationParsedValues,
            type: 'contractor',
            country_code: internalCountryCode,
            external_id: externalId,
          };

          try {
            const response = await createEmploymentMutationAsync(
              basicInformationPayload,
            );
            // @ts-expect-error the types from the response are not matching
            const employmentId = response?.data?.employment?.id;
            await updateUKandSaudiFieldsMutation({
              employmentId: employmentId as string,
            });

            setInternalEmploymentId(employmentId);

            return response;
          } catch (error) {
            console.error('Error creating onboarding:', error);
            throw error;
          }
        } else if (internalEmploymentId) {
          const basicInformationParsedValues = omit(
            parsedValues,
            'saudi_nationality_status',
            'ir35',
            'ir35_sds_file',
          );

          try {
            await updateUKandSaudiFieldsMutation({
              employmentId: internalEmploymentId,
            });
            return updateEmploymentMutationAsync({
              employmentId: internalEmploymentId,
              basic_information: basicInformationParsedValues,
            });
          } catch (error) {
            console.error('Error updating onboarding:', error);
            throw error;
          }
        }

        return;
      }
      case 'contract_details': {
        const payload: CreateContractDocument = {
          contract_document: parsedValues,
        };
        try {
          const response = await createContractorContractDocumentMutationAsync({
            employmentId: internalEmploymentId as string,
            payload,
          });
          // @ts-expect-error the types from the response are not matching
          const contractDocumentId = response?.data?.contract_document?.id;
          setInternalContractDocumentId(contractDocumentId);
          return response;
        } catch (error) {
          console.error('Error creating contract document:', error);
          throw error;
        }
      }

      case 'contract_preview': {
        try {
          return signContractDocumentMutationAsync({
            employmentId: internalEmploymentId as string,
            contractDocumentId: internalContractDocumentId as string,
            payload: {
              signature: values.signature,
            },
          });
        } catch (error) {
          console.error('Error signing contract document:', error);
          throw error;
        }
      }
      case 'pricing_plan': {
        try {
          if (values.subscription == contractorStandardProductIdentifier) {
            return manageContractorSubscriptionMutationAsync({
              employmentId: internalEmploymentId as string,
              payload: {
                operation: 'downgrade',
              },
            });
          } else if (values.subscription == contractorPlusProductIdentifier) {
            return manageContractorSubscriptionMutationAsync({
              employmentId: internalEmploymentId as string,
              payload: {
                operation: 'upgrade',
              },
            });
          }
          return Promise.reject({ error: 'invalid selection' });
        } catch (error) {
          console.error('Error managing contractor subscription:', error);
          throw error;
        }
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
    isLoadingContractorSubscriptions ||
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

      if (
        basicInformationForm &&
        stepState.currentStep.name === 'basic_information'
      ) {
        const parsedValues = await parseJSFToValidate(
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
        const parsedValues = await parseJSFToValidate(
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
        const parsedValues = await parseJSFToValidate(
          values,
          signatureSchemaForm?.fields,
          { isPartialValidation: true },
        );
        return signatureSchemaForm?.handleValidation(parsedValues);
      }

      if (
        selectContractorSubscriptionForm &&
        stepState.currentStep.name === 'pricing_plan'
      ) {
        const parsedValues = await parseJSFToValidate(
          values,
          selectContractorSubscriptionForm?.fields,
          { isPartialValidation: false },
        );
        return selectContractorSubscriptionForm?.handleValidation(parsedValues);
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
     * Function to refetch the employment data
     * @returns {void}
     */
    refetchEmployment: refetchEmployment,

    /**
     * Loading state indicating if the onboarding mutation is in progress
     */
    isSubmitting:
      createEmploymentMutation.isPending ||
      updateEmploymentMutation.isPending ||
      createContractorContractDocumentMutation.isPending ||
      manageContractorSubscriptionMutation.isPending ||
      signContractDocumentMutation.isPending ||
      uploadFileMutation.isPending,

    /**
     * Document preview PDF data
     */
    documentPreviewPdf,

    /**
     * let's the user know if the company can invite employees
     * @returns {boolean}
     */
    canInvite,

    /**
     * let's the user know that the employment cannot be edited, happens when employment.status is invited
     * @returns {boolean}
     */
    isEmploymentReadOnly,
    /**
     * let's the user know if the employment is invited or not
     * @returns {'invited' | 'not_invited'}
     */
    invitedStatus,

    /**
     * Employment data
     * @returns {Employment}
     */
    employment,
  };
};
