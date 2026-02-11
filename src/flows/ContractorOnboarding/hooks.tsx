import { useEffect, useMemo, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import omit from 'lodash.omit';
import { $TSFixMe, JSFFields } from '@/src/types/remoteFlows';
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
  useGetIR35File,
  useGetContractDocuments,
  useGetEligibilityQuestionnaire,
  usePostCreateEligibilityQuestionnaire,
  usePostManageContractorCorSubscription,
  useDeleteContractorCorSubscription,
} from '@/src/flows/ContractorOnboarding/api';
import { ContractorOnboardingFlowProps } from '@/src/flows/ContractorOnboarding/types';
import {
  buildSteps,
  calculateProvisionalStartDateDescription,
  StepKeys,
} from '@/src/flows/ContractorOnboarding/utils';
import {
  useCountriesSchemaField,
  useCreateEmployment,
  useJSONSchemaForm,
  useUpdateEmployment,
} from '@/src/flows/Onboarding/api';
import {
  disabledInviteButtonEmploymentStatus,
  reviewStepAllowedEmploymentStatus,
} from '@/src/flows/Onboarding/utils';
import { FlowOptions, JSFModify, JSONSchemaFormType } from '@/src/flows/types';
import { useStepState } from '@/src/flows/useStepState';
import { mutationToPromise } from '@/src/lib/mutations';
import { createStructuredError, prettifyFormValues } from '@/src/lib/utils';
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
import { dataURLtoFile } from '@/src/lib/files';
import { useEmploymentQuery } from '@/src/common/api/employment';
import { useDefaultLegalEntity } from '@/src/common/api/legal-entities';

type useContractorOnboardingProps = Omit<
  ContractorOnboardingFlowProps,
  'render'
>;

const stepToFormSchemaMap: Record<StepKeys, JSONSchemaFormType | null> = {
  select_country: null,
  basic_information: 'employment_basic_information',
  contract_details: null,
  eligibility_questionnaire: null,
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
    eligibility_questionnaire: Meta;
  }>({
    select_country: {},
    basic_information: {},
    contract_details: {},
    contract_preview: {},
    pricing_plan: {},
    eligibility_questionnaire: {},
  });

  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(
    undefined,
  );

  const { steps, stepsArray } = useMemo(
    () =>
      buildSteps({
        includeSelectCountry: !skipSteps?.includes('select_country'),
        includeEligibilityQuestionnaire:
          selectedProduct === corProductIdentifier,
      }),
    [selectedProduct, skipSteps],
  );

  const {
    fieldValues,
    stepState,
    setFieldValues,
    previousStep,
    nextStep,
    goToStep,
    setStepValues,
  } = useStepState(steps);

  const {
    data: employment,
    isLoading: isLoadingEmployment,
    refetch: refetchEmployment,
  } = useEmploymentQuery({
    employmentId: internalEmploymentId as string,
    queryParams: { exclude_files: true },
  });

  const defaultLegalEntity = useDefaultLegalEntity();

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
  const createEligibilityQuestionnaireMutation =
    usePostCreateEligibilityQuestionnaire();
  const manageContractorCorSubscriptionMutation =
    usePostManageContractorCorSubscription();

  const { mutateAsyncOrThrow: updateEmploymentMutationAsync } =
    mutationToPromise(updateEmploymentMutation);
  const signContractDocumentMutation = useSignContractDocument();
  const manageContractorSubscriptionMutation =
    usePostManageContractorSubscriptions();
  const deleteContractorCorSubscriptionMutation =
    useDeleteContractorCorSubscription();

  const { mutateAsyncOrThrow: createEmploymentMutationAsync } =
    mutationToPromise(createEmploymentMutation);

  const { mutateAsyncOrThrow: createContractorContractDocumentMutationAsync } =
    mutationToPromise(createContractorContractDocumentMutation);

  const { mutateAsyncOrThrow: signContractDocumentMutationAsync } =
    mutationToPromise(signContractDocumentMutation);

  const { mutateAsyncOrThrow: manageContractorSubscriptionMutationAsync } =
    mutationToPromise(manageContractorSubscriptionMutation);

  const { mutateAsyncOrThrow: createEligibilityQuestionnaireMutationAsync } =
    mutationToPromise(createEligibilityQuestionnaireMutation);

  const { mutateAsyncOrThrow: manageContractorCorSubscriptionMutationAsync } =
    mutationToPromise(manageContractorCorSubscriptionMutation);

  const { mutateAsyncOrThrow: deleteContractorCorSubscriptionMutationAsync } =
    mutationToPromise(deleteContractorCorSubscriptionMutation);

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
    contractorSubscriptions,
    refetch: refetchContractorSubscriptions,
  } = useContractorSubscriptionSchemaField(internalEmploymentId as string, {
    jsonSchemaVersion: options?.jsonSchemaVersion,
    queryOptions: {
      enabled:
        stepState.currentStep.name === 'pricing_plan' ||
        (Boolean(employmentId) && isEmploymentReadOnly),
    },
    jsfModify: options?.jsfModify?.pricing_plan,
  });

  const hasEligibilityQuestionnaireSubmitted = useMemo(() => {
    return Boolean(
      contractorSubscriptions?.find(
        (subscription) => subscription.product.short_name === 'COR',
      )?.eligibility_questionnaire?.submitted_at,
    );
  }, [contractorSubscriptions]);

  const isEligibilityBlocked = useMemo(() => {
    const corSubscription = contractorSubscriptions?.find(
      (subscription) => subscription.product.short_name === 'COR',
    );

    return corSubscription?.eligibility_questionnaire?.is_blocking;
  }, [contractorSubscriptions]);

  const eligibilityAnswers = useMemo(() => {
    return contractorSubscriptions?.find(
      (subscription) => subscription.product.short_name === 'COR',
    )?.eligibility_questionnaire?.responses;
  }, [contractorSubscriptions]);

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

  const isIR35FileEnabled = Boolean(
    internalCountryCode === 'GBR' &&
      employmentId &&
      stepState.currentStep.name === 'basic_information',
  );

  const { data: ir35File, isLoading: isLoadingIR35File } = useGetIR35File(
    employmentId as string,
    {
      enabled: isIR35FileEnabled,
    },
  );

  const { data: contractDocuments, isLoading: isLoadingContractDocuments } =
    useGetContractDocuments(employmentId as string, {
      enabled: Boolean(employmentId),
    });

  useEffect(() => {
    if (
      contractDocuments &&
      contractDocuments.length > 0 &&
      !internalContractDocumentId
    ) {
      setInternalContractDocumentId(contractDocuments[0].id);
    }
  }, [contractDocuments, internalContractDocumentId]);

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

  /**
   * When the user selects COR, the data isn't saved yet in the BE
   * We need to use the internalState to know what has happened
   */
  const selectedPricingPlan = useMemo(() => {
    const subscriptions = {
      standard: contractorStandardProductIdentifier,
      plus: contractorPlusProductIdentifier,
      cor: corProductIdentifier,
    };

    // HIGHEST PRIORITY: Current form value (user is actively selecting)
    if (fieldValues.subscription) {
      return fieldValues.subscription;
    }

    // SECOND: Previously submitted value in this session
    const subscription = stepState.values?.pricing_plan?.subscription;
    if (subscription) {
      return subscription;
    }

    // THIRD: Backend state (eligibility submitted or employment contractor_type)
    if (hasEligibilityQuestionnaireSubmitted) {
      return corProductIdentifier;
    }

    // FALLBACK: Employment contractor_type or default
    return (
      subscriptions[
        employment?.contractor_type as keyof typeof subscriptions
      ] || contractorStandardProductIdentifier
    );
  }, [
    fieldValues.subscription,
    stepState.values?.pricing_plan?.subscription,
    hasEligibilityQuestionnaireSubmitted,
    employment?.contractor_type,
  ]);

  useEffect(() => {
    if (selectedPricingPlan && selectedPricingPlan !== selectedProduct) {
      setSelectedProduct(selectedPricingPlan);
    }
  }, [selectedPricingPlan, selectedProduct]);

  const eligibilityFields = {
    ...eligibilityAnswers,
    ...onboardingInitialValues,
    ...stepState.values?.eligibility_questionnaire,
    ...fieldValues,
  };

  const { data: eligibilityQuestionnaireForm } = useGetEligibilityQuestionnaire(
    {
      options: {
        queryOptions: {
          enabled: selectedPricingPlan === corProductIdentifier,
        },
        jsfModify: options?.jsfModify?.eligibility_questionnaire,
      },
      fieldValues: eligibilityFields,
    },
  );

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

  const isSignatureSchemaEnabled = useMemo(() => {
    return (
      stepState.currentStep.name === 'contract_preview' ||
      (Boolean(employmentId) && isEmploymentReadOnly)
    );
  }, [stepState.currentStep.name, employmentId, isEmploymentReadOnly]);

  const { data: signatureSchemaForm } = useGetContractDocumentSignatureSchema({
    fieldValues: fieldValues,
    options: {
      queryOptions: {
        enabled: isSignatureSchemaEnabled,
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

  const stepFields: Record<StepKeys, JSFFields> = useMemo(
    () => ({
      select_country: selectCountryForm?.fields || [],
      basic_information: basicInformationForm?.fields || [],
      pricing_plan: selectContractorSubscriptionForm?.fields || [],
      eligibility_questionnaire: eligibilityQuestionnaireForm?.fields || [],
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
      eligibilityQuestionnaireForm?.fields,
    ],
  );

  const stepFieldsWithFlatFieldsets: Record<
    StepKeys,
    JSFFieldset | null | undefined
  > = {
    select_country: null,
    basic_information: basicInformationForm?.meta['x-jsf-fieldsets'],
    pricing_plan: null,
    contract_details: contractorOnboardingDetailsForm?.meta['x-jsf-fieldsets'],
    eligibility_questionnaire: null,
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

  // memoize file conversion to avoid re-converting the file on every render
  // noticed performance issues when not doing memoizing individually
  const convertedIr35File = useMemo(() => {
    if (!ir35File?.content) return null;
    return dataURLtoFile(ir35File.content as unknown as string, ir35File.name);
  }, [ir35File?.content, ir35File?.name]);

  const basicInformationInitialValues = useMemo(() => {
    const initialValues = {
      provisional_start_date: provisionalStartDate,
      ...onboardingInitialValues,
      ...employmentBasicInformation,
      ir35: employment?.contract_details?.ir_35,
      saudi_nationality_status: employment?.contract_details?.nationality,
      ...(convertedIr35File && {
        ir35_sds_file: [convertedIr35File],
      }),
    };

    return getInitialValues(stepFields.basic_information, initialValues);
  }, [
    onboardingInitialValues,
    employmentBasicInformation,
    employment?.contract_details?.ir_35,
    employment?.contract_details?.nationality,
    convertedIr35File,
    stepFields.basic_information,
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
    const signature = documentPreviewPdf?.contract_document?.signatories?.find(
      (signatory) => signatory.type === 'company',
    );
    const initialValues = {
      ...onboardingInitialValues,
      signature: signature?.signature,
    };

    return getInitialValues(stepFields.contract_preview, initialValues);
  }, [
    stepFields.contract_preview,
    onboardingInitialValues,
    documentPreviewPdf,
  ]);

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

  const eligibilityQuestionnaireInitialValues = useMemo(() => {
    const initialValues = {
      ...onboardingInitialValues,
      ...eligibilityAnswers,
    };
    return getInitialValues(
      stepFields.eligibility_questionnaire,
      initialValues,
    );
  }, [
    stepFields.eligibility_questionnaire,
    onboardingInitialValues,
    eligibilityAnswers,
  ]);

  const initialValues = useMemo(() => {
    return {
      select_country: selectCountryInitialValues,
      basic_information: basicInformationInitialValues,
      contract_details: contractDetailsInitialValues,
      contract_preview: contractPreviewInitialValues,
      pricing_plan: pricingPlanInitialValues,
      eligibility_questionnaire: eligibilityQuestionnaireInitialValues,
    };
  }, [
    selectCountryInitialValues,
    basicInformationInitialValues,
    contractDetailsInitialValues,
    contractPreviewInitialValues,
    pricingPlanInitialValues,
    eligibilityQuestionnaireInitialValues,
  ]);

  const shouldHandleReadOnlyEmployment = Boolean(
    employmentId &&
      isEmploymentReadOnly &&
      stepState.currentStep.name !== 'review',
  );

  const initialLoading =
    isLoadingCountries ||
    isLoadingBasicInformationForm ||
    isLoadingEmployment ||
    isLoadingContractorOnboardingDetailsForm ||
    isLoadingContractorSubscriptions ||
    isLoadingDocumentPreviewForm ||
    isLoadingIR35File ||
    isLoadingContractDocuments;

  const isNavigatingToReview = useMemo(() => {
    return Boolean(
      shouldHandleReadOnlyEmployment &&
        !initialLoading &&
        Boolean(internalContractDocumentId) &&
        stepFields.basic_information.length > 0 &&
        stepFields.contract_details.length > 0 &&
        stepFields.contract_preview.length > 0,
    );
  }, [
    shouldHandleReadOnlyEmployment,
    initialLoading,
    internalContractDocumentId,
    stepFields.basic_information.length,
    stepFields.contract_details.length,
    stepFields.contract_preview.length,
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
        contract_preview: prettifyFormValues(
          contractPreviewInitialValues,
          stepFields.contract_preview,
        ),
        pricing_plan: prettifyFormValues(
          pricingPlanInitialValues,
          stepFields.pricing_plan,
        ),
        // TODO: we have to check if this works well or not
        eligibility_questionnaire: prettifyFormValues(
          eligibilityQuestionnaireInitialValues,
          stepFields.eligibility_questionnaire,
        ),
      };

      setStepValues({
        select_country: selectCountryInitialValues,
        basic_information: basicInformationInitialValues,
        contract_details: contractDetailsInitialValues,
        // TODO: we need to retrieve the contract preview data somehow from the BE, who signed the document
        contract_preview: {},
        pricing_plan: pricingPlanInitialValues,
        // TODO: we need to retrieve information somehow only for COR though
        eligibility_questionnaire: {},
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
    stepFields.contract_preview,
    contractPreviewInitialValues,
    stepFields.eligibility_questionnaire,
    eligibilityQuestionnaireInitialValues,
  ]);

  const goTo = (step: StepKeys) => {
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

    if (
      eligibilityQuestionnaireForm &&
      stepState.currentStep.name === 'eligibility_questionnaire'
    ) {
      return await parseJSFToValidate(
        values,
        eligibilityQuestionnaireForm?.fields,
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
          const response = await createEmploymentMutationAsync(
            basicInformationPayload,
          );
          const employmentId = response?.data?.employment?.id;
          if (!employmentId) {
            throw createStructuredError('Employment ID not found');
          }

          setInternalEmploymentId(employmentId);
          await updateUKandSaudiFieldsMutation({
            employmentId: employmentId as string,
          });

          return response;
        } else if (internalEmploymentId) {
          const basicInformationParsedValues = omit(
            parsedValues,
            'saudi_nationality_status',
            'ir35',
            'ir35_sds_file',
          );

          await updateUKandSaudiFieldsMutation({
            employmentId: internalEmploymentId,
          });
          return updateEmploymentMutationAsync({
            employmentId: internalEmploymentId,
            basic_information: basicInformationParsedValues,
          });
        }

        return;
      }
      case 'contract_details': {
        const payload: CreateContractDocument = {
          contract_document: parsedValues,
        };
        const response = await createContractorContractDocumentMutationAsync({
          employmentId: internalEmploymentId as string,
          payload,
        });
        const contractDocumentId = response?.data?.contract_document?.id;
        if (!contractDocumentId) {
          throw createStructuredError('Contract document ID not found');
        }
        setInternalContractDocumentId(contractDocumentId);
        return response;
      }

      case 'contract_preview': {
        return signContractDocumentMutationAsync({
          employmentId: internalEmploymentId as string,
          contractDocumentId: internalContractDocumentId as string,
          payload: {
            signature: parsedValues.signature,
          },
        });
      }
      case 'pricing_plan': {
        if (
          hasEligibilityQuestionnaireSubmitted &&
          values.subscription !== corProductIdentifier
        ) {
          try {
            await deleteContractorCorSubscriptionMutationAsync({
              employmentId: internalEmploymentId as string,
            });
            await refetchContractorSubscriptions();
          } catch (error) {
            if ((error as $TSFixMe)?.response?.status !== 404) {
              throw error;
            }
            // Still refetch to update the UI state
            await refetchContractorSubscriptions();
          }
        }

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
        } else if (values.subscription == corProductIdentifier) {
          return Promise.resolve({
            data: { subscription: values.subscription },
          });
        }

        throw createStructuredError('invalid selection');
      }

      case 'eligibility_questionnaire': {
        // TODO: for now skip sending the questionnaire if it has been submitted or is blockedº
        if (hasEligibilityQuestionnaireSubmitted || isEligibilityBlocked) {
          return Promise.resolve({
            data: { eligibility_questionnaire: parsedValues },
          });
        }

        await createEligibilityQuestionnaireMutationAsync({
          employmentId: internalEmploymentId as string,
          payload: parsedValues,
        });
        const response = await manageContractorCorSubscriptionMutationAsync({
          employmentId: internalEmploymentId as string,
        });

        await refetchContractorSubscriptions();
        return response;
      }

      default: {
        throw createStructuredError('Invalid step state');
      }
    }
  }

  const isLoading = initialLoading || shouldHandleReadOnlyEmployment;

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

      if (
        eligibilityQuestionnaireForm &&
        stepState.currentStep.name === 'eligibility_questionnaire'
      ) {
        const parsedValues = await parseJSFToValidate(
          values,
          eligibilityQuestionnaireForm?.fields,
          { isPartialValidation: false },
        );
        return eligibilityQuestionnaireForm?.handleValidation(parsedValues);
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
      signContractDocumentMutation.isPending ||
      manageContractorSubscriptionMutation.isPending ||
      uploadFileMutation.isPending ||
      createEligibilityQuestionnaireMutation.isPending ||
      manageContractorCorSubscriptionMutation.isPending ||
      deleteContractorCorSubscriptionMutation.isPending,

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

    /**
     * Default legal entity
     * @returns {CompanyLegalEntity}
     */
    defaultLegalEntity,
    /**
     * Steps array
     * @returns {Array<{name: string, index: number, label: string}>}
     */
    steps: stepsArray,
  };
};
