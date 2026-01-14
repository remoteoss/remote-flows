import { useEffect, useMemo, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { JSFCustomComponentProps, JSFFields } from '@/src/types/remoteFlows';
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
} from '@/src/flows/ContractorOnboarding/api';
import { ContractorOnboardingFlowProps } from '@/src/flows/ContractorOnboarding/types';
import {
  STEPS,
  STEPS_WITHOUT_SELECT_COUNTRY,
  calculateProvisionalStartDateDescription,
  buildContractDetailsJsfModify,
} from '@/src/flows/ContractorOnboarding/utils';
import {
  useCountriesSchemaField,
  useCreateEmployment,
  useEmployment,
  useJSONSchemaForm,
} from '@/src/flows/Onboarding/api';
import {
  disabledInviteButtonEmploymentStatus,
  reviewStepAllowedEmploymentStatus,
} from '@/src/flows/Onboarding/utils';
import { FlowOptions, JSFModify, JSONSchemaFormType } from '@/src/flows/types';
import { Step, useStepState } from '@/src/flows/useStepState';
import { mutationToPromise } from '@/src/lib/mutations';
import { prettifyFormValues } from '@/src/lib/utils';
import { $TSFixMe, JSFFieldset, Meta } from '@/src/types/remoteFlows';
import {
  contractorStandardProductIdentifier,
  contractorPlusProductIdentifier,
} from '@/src/flows/ContractorOnboarding/constants';
import { ContractPreviewHeader } from '@/src/flows/ContractorOnboarding/components/ContractPreviewHeader';
import { ContractPreviewStatement } from '@/src/flows/ContractorOnboarding/components/ContractPreviewStatement';

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
  const createContractorContractDocumentMutation =
    useCreateContractorContractDocument();
  const signContractDocumentMutation = useSignContractDocument();
  const manageContractorSubscriptionMutation =
    usePostManageContractorSubscriptions();

  const { mutateAsync: createEmploymentMutationAsync } = mutationToPromise(
    createEmploymentMutation,
  );

  const { mutateAsync: createContractorContractDocumentMutationAsync } =
    mutationToPromise(createContractorContractDocumentMutation);

  const { mutateAsync: signContractDocumentMutationAsync } = mutationToPromise(
    signContractDocumentMutation,
  );

  const { mutateAsync: manageContractorSubscriptionMutationAsync } =
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

  const basicInformationJsfModify = useMemo(() => {
    const isSaudiArabia = internalCountryCode === 'SAU';
    const isUk = internalCountryCode === 'GBR';
    if (!isSaudiArabia && !isUk) {
      return options?.jsfModify?.basic_information;
    }

    if (isUk) {
      return {
        ...options?.jsfModify?.basic_information,
        create: {
          ...options?.jsfModify?.basic_information?.create,
          ir35: {
            title: 'IR35 Status',
            description:
              "What's your contractor's employment status? - Add Zendesk help link here",
            oneOf: [
              {
                const: 'inside',
                title: 'Inside IR35 (deemed employee)',
              },
              {
                const: 'outside',
                title: 'Outside IR35',
              },
              {
                const: 'exempt',
                title: 'Exempt from IR35',
              },
            ],
            'x-jsf-presentation': {
              inputType: 'select',
            },
          },
        },
        orderRoot: (originalOrder) => {
          return [...originalOrder, 'ir35'];
        },
      };
    }

    // Add Saudi nationality field when country is Saudi Arabia
    return {
      ...options?.jsfModify?.basic_information,
      create: {
        ...options?.jsfModify?.basic_information?.create,
        saudi_nationality_status: {
          title:
            'Is your contractor a Saudi Arabia national, or a non-Saudi national contracting via a local business entity or under a Special Privilege Iqama visa?',
          description: '',
          type: 'string',
          oneOf: [
            {
              const: 'national',
              description: '',
              title: 'Yes',
            },
            {
              const: 'non-national',
              description:
                'Please be aware that contracting with non-Saudi Arabia nationals that are not operating as a company or under a Special Privilege Iqama visa can lead to fines for operating without proper work authorization. If you are concerned, please speak with the Contractor and/or local Saudi Arabia counsel to ensure compliance.',
              title: 'No',
            },
          ],
          'x-jsf-presentation': {
            inputType: 'radio',
          },
        },
      },
      orderRoot: (originalOrder) => {
        return [...originalOrder, 'saudi_nationality_status'];
      },
    };
  }, [internalCountryCode, options?.jsfModify?.basic_information]);

  const {
    data: basicInformationForm,
    isLoading: isLoadingBasicInformationForm,
  } = useJSONSchema({
    form: 'contractor_basic_information',
    options: {
      jsfModify: basicInformationJsfModify,
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
      ),
    },
  });

  const mergedContractPreviewJsfModify = useMemo(() => {
    const userFields = options?.jsfModify?.contract_preview?.fields;

    return {
      fields: {
        contract_preview_header: {
          ...userFields?.contract_preview_header,
          'x-jsf-presentation': {
            Component: (props: JSFCustomComponentProps) => {
              const CustomComponent =
                userFields?.contract_preview_header?.['x-jsf-presentation']
                  ?.Component || ContractPreviewHeader;
              return <CustomComponent {...props} />;
            },
          },
        },
        contract_preview_statement: {
          ...userFields?.contract_preview_statement,
          'x-jsf-presentation': {
            Component: (props: JSFCustomComponentProps) => {
              const CustomComponent =
                userFields?.contract_preview_statement?.['x-jsf-presentation']
                  ?.Component || ContractPreviewStatement;

              return (
                <CustomComponent
                  reviewCompleted={Boolean(fieldValues?.review_completed)}
                  {...props}
                />
              );
            },
          },
        },
        signature: {
          ...userFields?.signature,
          'x-jsf-presentation': {
            calculateDynamicProperties: (
              fieldValuesDynamicProperties: Record<string, unknown>,
            ) => {
              return {
                isVisible: Boolean(
                  fieldValuesDynamicProperties.review_completed,
                ),
              };
            },
            // Merge any user-provided signature customizations
            ...userFields?.signature?.['x-jsf-presentation'],
          },
        },
      },
    };
  }, [fieldValues?.review_completed, options?.jsfModify?.contract_preview]);

  const { data: signatureSchemaForm } = useGetContractDocumentSignatureSchema({
    fieldValues: fieldValues,
    options: {
      queryOptions: {
        enabled: stepState.currentStep.name === 'contract_preview',
      },
      jsfModify: mergedContractPreviewJsfModify,
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
    };

    return getInitialValues(stepFields.basic_information, initialValues);
  }, [
    stepFields.basic_information,
    employmentBasicInformation,
    onboardingInitialValues,
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
    const initialValues = {
      ...onboardingInitialValues,
      ...employmentContractDetails,
    };

    return getInitialValues(
      stepFields.pricing_plan,
      (initialValues?.pricing_plan ?? {}) as Record<string, unknown>,
    );
  }, [
    stepFields.pricing_plan,
    employmentContractDetails,
    onboardingInitialValues,
  ]);

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

        if (isEmploymentNotLoaded || hasChangedCountry) {
          const {
            saudi_nationality_status: saudiNationalityStatus,
            ir35: ir35Status,
            ...basicInformationParsedValues
          } = parsedValues;
          const basicInformationPayload: EmploymentCreateParams = {
            basic_information: basicInformationParsedValues,
            type: 'contractor',
            country_code: internalCountryCode,
            external_id: externalId,
          };
          const ir35ContractDetailsPayload = {
            contract_document: {
              details: {
                ir_35: ir35Status,
              },
            },
          };
          const saudiContractDetailsPayload = {
            contract_document: {
              details: {
                nationality: saudiNationalityStatus,
              },
            },
          };
          try {
            const response = await createEmploymentMutationAsync(
              basicInformationPayload,
            );
            // @ts-expect-error the types from the response are not matching
            const employmentId = response.data?.data?.employment?.id;
            if (ir35ContractDetailsPayload && employmentId) {
              await createContractorContractDocumentMutationAsync({
                employmentId: employmentId,
                payload: ir35ContractDetailsPayload,
              });
            }
            // TODO: probably we need to do updates in the BE to send nationality as standalone field
            if (saudiNationalityStatus && employmentId) {
              await createContractorContractDocumentMutationAsync({
                employmentId: employmentId,
                payload: saudiContractDetailsPayload,
              });
            }

            setInternalEmploymentId(employmentId);

            return response;
          } catch (error) {
            console.error('Error creating onboarding:', error);
            throw error;
          }
        } else if (internalEmploymentId) {
          // TODO: Provisional it seems you cannot update a contractor employment
          // TODO: we'll need to check later if the provisional start date gets updated for the statement of work
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
      case 'pricing_plan': {
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
      createContractorContractDocumentMutation.isPending ||
      signContractDocumentMutation.isPending,

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
