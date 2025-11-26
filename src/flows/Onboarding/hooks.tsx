import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import {
  Employment,
  EmploymentCreateParams,
  EmploymentFullParams,
} from '@/src/client';
import { Fields } from '@remoteoss/json-schema-form-old';
import { useStepState, Step } from '@/src/flows/useStepState';
import {
  disabledInviteButtonEmploymentStatus,
  getContractDetailsSchemaVersion,
  reviewStepAllowedEmploymentStatus,
  STEPS,
  STEPS_WITHOUT_SELECT_COUNTRY,
} from '@/src/flows/Onboarding/utils';
import { prettifyFormValues } from '@/src/lib/utils';
import {
  getInitialValues,
  enableAckFields,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { mutationToPromise } from '@/src/lib/mutations';
import { FieldValues } from 'react-hook-form';
import { OnboardingFlowProps } from '@/src/flows/Onboarding/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import mergeWith from 'lodash.mergewith';
import {
  useBenefitOffers,
  useBenefitOffersSchema,
  useCompany,
  useCountriesSchemaField,
  useCreateEmployment,
  useEmployment,
  useJSONSchemaForm,
  useUpdateBenefitsOffers,
  useUpdateEmployment,
  useUpsertContractEligibility,
} from '@/src/flows/Onboarding/api';
import {
  FlowOptions,
  JSFModifyNext,
  JSONSchemaFormType,
} from '@/src/flows/types';
import { AnnualGrossSalary } from '@/src/flows/Onboarding/components/AnnualGrossSalary';
import { $TSFixMe, JSFField, JSFFieldset, Meta } from '@/src/types/remoteFlows';
import { EquityPriceDetails } from '@/src/flows/Onboarding/components/EquityPriceDetails';
import { useErrorReporting } from '@/src/components/error-handling/useErrorReporting';

type OnboardingHookProps = Omit<OnboardingFlowProps, 'render'>;

const jsonSchemaToEmployment: Partial<
  Record<JSONSchemaFormType, keyof Employment>
> = {
  employment_basic_information: 'basic_information',
  contract_details: 'contract_details',
};

const stepToFormSchemaMap: Record<
  keyof typeof STEPS,
  JSONSchemaFormType | null
> = {
  select_country: null,
  basic_information: 'employment_basic_information',
  contract_details: 'contract_details',
  benefits: null,
  review: null,
};

const getLoadingStates = ({
  isLoadingBasicInformationForm,
  isLoadingContractDetailsForm,
  isLoadingEmployment,
  isLoadingBenefitsOffersSchema,
  isLoadingBenefitOffers,
  isLoadingCompany,
  isLoadingCountries,
  employmentStatus,
  employmentId,
  currentStepName,
  basicInformationFields,
  contractDetailsFields,
}: {
  isLoadingBasicInformationForm: boolean;
  isLoadingContractDetailsForm: boolean;
  isLoadingEmployment: boolean;
  isLoadingBenefitsOffersSchema: boolean;
  isLoadingBenefitOffers: boolean;
  isLoadingCompany: boolean;
  isLoadingCountries: boolean;
  employmentStatus?: Employment['status'];
  employmentId?: string;
  currentStepName: string;
  basicInformationFields: Fields;
  contractDetailsFields: Fields;
}) => {
  const initialLoading =
    isLoadingBasicInformationForm ||
    isLoadingContractDetailsForm ||
    isLoadingEmployment ||
    isLoadingBenefitsOffersSchema ||
    isLoadingBenefitOffers ||
    isLoadingCompany ||
    isLoadingCountries;

  const isEmploymentReadOnly =
    employmentStatus &&
    reviewStepAllowedEmploymentStatus.includes(employmentStatus);

  const canInvite =
    employmentStatus &&
    !disabledInviteButtonEmploymentStatus.includes(employmentStatus);

  const shouldHandleReadOnlyEmployment = Boolean(
    employmentId && isEmploymentReadOnly && currentStepName !== 'review',
  );

  const isLoading = initialLoading || shouldHandleReadOnlyEmployment;

  const isNavigatingToReview = Boolean(
    shouldHandleReadOnlyEmployment &&
      !initialLoading &&
      basicInformationFields.length > 0 &&
      contractDetailsFields.length > 0,
  );

  return {
    isLoading,
    isNavigatingToReview,
    isEmploymentReadOnly,
    canInvite,
  };
};

export const useOnboarding = ({
  employmentId,
  companyId,
  countryCode,
  type,
  options,
  skipSteps,
  externalId,
  initialValues: onboardingInitialValues,
}: OnboardingHookProps) => {
  const { updateErrorContext } = useErrorReporting({
    flow: 'onboarding',
    metadata: {
      employmentId,
      companyId,
      isUpdating: Boolean(employmentId),
    },
  });
  const stepsToUse = skipSteps?.includes('select_country')
    ? STEPS_WITHOUT_SELECT_COUNTRY
    : STEPS;

  const onStepChange = useCallback(
    (step: Step<keyof typeof STEPS>) => {
      updateErrorContext({
        step: step.name,
      });
    },
    [updateErrorContext],
  );

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
    onStepChange,
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
  const [internalEmploymentId, setInternalEmploymentId] = useState<
    string | undefined
  >(employmentId);
  const [internalCountryCode, setInternalCountryCode] = useState<string | null>(
    countryCode || null,
  );
  const {
    data: employment,
    isLoading: isLoadingEmployment,
    refetch: refetchEmployment,
  } = useEmployment(internalEmploymentId);

  // if the employment is loaded, country code has not been set yet
  // we set the internal country code with the employment country code
  if (employmentId && employment?.country?.code && !internalCountryCode) {
    setInternalCountryCode(employment.country.code);
  }

  const { data: benefitOffers, isLoading: isLoadingBenefitOffers } =
    useBenefitOffers(internalEmploymentId);

  const {
    data: company,
    isLoading: isLoadingCompany,
    refetch: refetchCompany,
  } = useCompany(companyId);

  const { selectCountryForm, isLoading: isLoadingCountries } =
    useCountriesSchemaField({
      jsfModify: options?.jsfModify?.select_country,
      queryOptions: {
        enabled: stepState.currentStep.name === 'select_country',
      },
    });

  const createEmploymentMutation = useCreateEmployment(options);
  const updateEmploymentMutation = useUpdateEmployment(options);
  const updateBenefitsOffersMutation = useUpdateBenefitsOffers(options);
  const updateContractEligibilityMutation = useUpsertContractEligibility();
  const { mutateAsync: createEmploymentMutationAsync } = mutationToPromise(
    createEmploymentMutation,
  );
  const { mutateAsync: updateEmploymentMutationAsync } = mutationToPromise(
    updateEmploymentMutation,
  );
  const { mutateAsync: updateBenefitsOffersMutationAsync } = mutationToPromise(
    updateBenefitsOffersMutation,
  );

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
      jsfModify?: JSFModifyNext;
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
        jsonSchemaVersion: jsonSchemaOptions.jsonSchemaVersion,
      },
    });
  };

  const isBasicInformationDetailsEnabled = Boolean(
    internalCountryCode &&
      (stepState.currentStep.name === 'basic_information' ||
        Boolean(employmentId)),
  );

  const isContractDetailsEnabled = Boolean(
    internalCountryCode &&
      (stepState.currentStep.name === 'contract_details' ||
        Boolean(employmentId)),
  );

  const {
    data: basicInformationForm,
    isLoading: isLoadingBasicInformationForm,
  } = useJSONSchema({
    form: 'employment_basic_information',
    options: {
      jsfModify: options?.jsfModify?.basic_information,
      jsonSchemaVersion: options?.jsonSchemaVersion,
      queryOptions: {
        enabled: isBasicInformationDetailsEnabled,
      },
    },
  });

  const annualGrossSalaryField =
    options?.jsfModify?.contract_details?.fields?.annual_gross_salary;
  const annualSalaryFieldPresentation =
    annualGrossSalaryField &&
    typeof annualGrossSalaryField === 'object' &&
    'presentation' in annualGrossSalaryField
      ? (
          annualGrossSalaryField as {
            presentation?: {
              annual_gross_salary_conversion_properties?: {
                label?: string;
                description?: string;
              };
            };
          }
        ).presentation
      : undefined;

  const equityCompensationField =
    options?.jsfModify?.contract_details?.fields?.equity_compensation;

  const contractDetailsCustomFields = useMemo(
    () => ({
      fields: {
        annual_gross_salary: {
          ...annualGrossSalaryField,
          presentation: {
            annual_gross_salary_conversion_properties: {
              label:
                annualSalaryFieldPresentation
                  ?.annual_gross_salary_conversion_properties?.label,
              description:
                annualSalaryFieldPresentation
                  ?.annual_gross_salary_conversion_properties?.description,
            },
            desiredCurrency: company?.desired_currency,
            Component: (props: JSFField & { currency: string }) => {
              return (
                <AnnualGrossSalary
                  desiredCurrency={company?.desired_currency || ''}
                  {...props}
                />
              );
            },
          },
        },
        equity_compensation: {
          ...equityCompensationField,
          presentation: {
            calculateDynamicProperties: (
              values: FieldValues,
              field: JSFField,
            ) => {
              const offerEquity =
                values.equity_compensation?.offer_equity_compensation;
              const equityCost = field?.meta?.cost;

              return {
                extra: (
                  <EquityPriceDetails
                    offerEquity={offerEquity}
                    equityCost={equityCost as $TSFixMe}
                  />
                ),
              };
            },
          },
        },
      },
    }),
    [
      annualGrossSalaryField,
      annualSalaryFieldPresentation,
      company?.desired_currency,
      equityCompensationField,
    ],
  );

  const effectiveContractDetailsJsonSchemaVersion =
    getContractDetailsSchemaVersion(options?.jsonSchemaVersion);

  const { data: contractDetailsForm, isLoading: isLoadingContractDetailsForm } =
    useJSONSchema({
      form: 'contract_details',
      query: {
        employment_id: internalEmploymentId as string,
      },
      options: {
        jsfModify: {
          ...options?.jsfModify?.contract_details,
          fields: {
            ...options?.jsfModify?.contract_details?.fields,
            ...contractDetailsCustomFields.fields,
          },
        },
        queryOptions: {
          enabled: isContractDetailsEnabled,
        },
        jsonSchemaVersion: effectiveContractDetailsJsonSchemaVersion,
      },
    });

  const {
    data: benefitOffersSchema,
    isLoading: isLoadingBenefitsOffersSchema,
  } = useBenefitOffersSchema(
    internalEmploymentId as string,
    fieldValues,
    options,
  );

  const initialValuesBenefitOffers = useMemo(() => {
    if (stepState.currentStep.name === 'benefits') {
      const benefitsFormValues = {
        ...stepState.values?.[stepState.currentStep.name as keyof typeof STEPS], // Restore values for the current step
        ...fieldValues,
      };
      return mergeWith({}, benefitOffers, benefitsFormValues);
    }
    return {};
  }, [
    stepState.currentStep.name,
    benefitOffers,
    stepState.values,
    fieldValues,
  ]);

  const stepFields: Record<keyof typeof STEPS, Fields> = useMemo(
    () => ({
      select_country: selectCountryForm?.fields || [],
      basic_information: basicInformationForm?.fields || [],
      contract_details: contractDetailsForm?.fields || [],
      benefits: benefitOffersSchema?.fields || [],
      review: [],
    }),
    [
      selectCountryForm?.fields,
      basicInformationForm?.fields,
      contractDetailsForm?.fields,
      benefitOffersSchema?.fields,
    ],
  );

  const stepFieldsWithFlatFieldsets: Record<
    keyof typeof STEPS,
    JSFFieldset | null | undefined
  > = {
    select_country: null,
    basic_information: basicInformationForm?.meta['x-jsf-fieldsets'],
    contract_details: contractDetailsForm?.meta['x-jsf-fieldsets'],
    benefits: null,
    review: null,
  };

  const {
    country,
    basic_information: employmentBasicInformation = {},
    contract_details: employmentContractDetails = {},
    status: employmentStatus,
  } = employment || {};

  const employmentCountryCode = country?.code;
  const currentStepName = stepState.currentStep.name;

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

  const benefitsInitialValues = useMemo(() => {
    const initialValues = {
      ...onboardingInitialValues,
      ...initialValuesBenefitOffers,
    };

    return getInitialValues(stepFields.benefits, initialValues);
  }, [
    stepFields.benefits,
    initialValuesBenefitOffers,
    onboardingInitialValues,
  ]);

  const initialValues = useMemo(() => {
    if (employment) {
      return {
        select_country: selectCountryInitialValues,
        // We don't store ack fields in the db, eg "ack_start_date_ammendment" for Argentina, and therefore is not returned in the employment response
        // So when an employmentId exists, it means that the user has already started the onboarding process, and we need to enable the ack fields
        basic_information: enableAckFields(
          stepFields['basic_information'],
          basicInformationInitialValues,
        ),
        contract_details:
          // if contract details is null, it means it has not been filled yet, so we can't enable the ack fields
          employment?.contract_details !== null
            ? enableAckFields(
                stepFields['contract_details'],
                contractDetailsInitialValues,
              )
            : contractDetailsInitialValues,
        benefits: benefitsInitialValues,
      };
    }
    return {
      select_country: selectCountryInitialValues,
      basic_information: basicInformationInitialValues,
      contract_details: contractDetailsInitialValues,
      benefits: benefitsInitialValues,
    };
  }, [
    selectCountryInitialValues,
    basicInformationInitialValues,
    contractDetailsInitialValues,
    benefitsInitialValues,
    employment,
    stepFields,
  ]);

  const { isLoading, isNavigatingToReview, isEmploymentReadOnly, canInvite } =
    useMemo(
      () =>
        getLoadingStates({
          isLoadingBasicInformationForm,
          isLoadingContractDetailsForm,
          isLoadingEmployment,
          isLoadingBenefitsOffersSchema,
          isLoadingBenefitOffers,
          isLoadingCompany,
          isLoadingCountries,
          employmentId,
          employmentStatus: employmentStatus,
          basicInformationFields: stepFields.basic_information,
          contractDetailsFields: stepFields.contract_details,
          currentStepName: currentStepName,
        }),
      [
        isLoadingBasicInformationForm,
        isLoadingContractDetailsForm,
        isLoadingEmployment,
        isLoadingBenefitsOffersSchema,
        isLoadingBenefitOffers,
        isLoadingCompany,
        isLoadingCountries,
        employmentId,
        employmentStatus,
        stepFields.basic_information,
        stepFields.contract_details,
        currentStepName,
      ],
    );

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
        benefits: prettifyFormValues(
          benefitsInitialValues,
          stepFields.benefits,
        ),
      };

      setStepValues({
        select_country: selectCountryInitialValues,
        basic_information: basicInformationInitialValues,
        contract_details: contractDetailsInitialValues,
        benefits: benefitsInitialValues,
        review: {},
      });

      goToStep('review');
    }
  }, [
    basicInformationInitialValues,
    benefitsInitialValues,
    contractDetailsInitialValues,
    goToStep,
    isNavigatingToReview,
    selectCountryInitialValues,
    setStepValues,
    stepFields.basic_information,
    stepFields.benefits,
    stepFields.contract_details,
    stepFields.select_country,
  ]);

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
      contractDetailsForm &&
      stepState.currentStep.name === 'contract_details'
    ) {
      return await parseJSFToValidate(values, contractDetailsForm?.fields, {
        isPartialValidation: false,
      });
    }

    return {};
  };

  async function onSubmit(values: FieldValues) {
    // Prettify values for the current step
    const currentStepName = stepState.currentStep.name;
    if (currentStepName in fieldsMetaRef.current) {
      fieldsMetaRef.current[
        currentStepName as keyof typeof fieldsMetaRef.current
      ] = prettifyFormValues(values, stepFields[currentStepName]);
    }

    const parsedValues = await parseFormValues(values);
    refetchCompany();
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
            type: type,
            country_code: internalCountryCode,
            external_id: externalId,
          };
          try {
            const response = await createEmploymentMutationAsync(payload);
            // @ts-expect-error the types from the response are not matching
            const employmentId = response.data?.data?.employment?.id;
            setInternalEmploymentId(employmentId);
            await updateContractEligibilityMutation.mutateAsync({
              employmentId: employmentId,
              eligible_to_work_in_residing_country: 'citizen',
              employer_or_work_restrictions: false,
            });

            return response;
          } catch (error) {
            console.error('Error creating onboarding:', error);
            throw error;
          }
        } else if (internalEmploymentId) {
          return updateEmploymentMutationAsync({
            employmentId: internalEmploymentId,
            basic_information: parsedValues,
            pricing_plan_details: {
              frequency: 'monthly',
            },
            external_id: externalId,
          });
        }

        return;
      }
      case 'contract_details': {
        const payload: EmploymentFullParams = {
          contract_details: parsedValues,
          pricing_plan_details: {
            frequency: 'monthly',
          },
        };
        return updateEmploymentMutationAsync({
          employmentId: internalEmploymentId as string,
          external_id: externalId,
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
    updateErrorContext({
      step: stepState.currentStep.name,
    });
  }

  function next() {
    nextStep();
    updateErrorContext({
      step: stepState.currentStep.name,
    });
  }

  function goTo(step: keyof typeof STEPS) {
    updateErrorContext({
      step: step,
    });
    goToStep(step);
  }

  return {
    /**
     * Employment id passed useful to be used between components
     */
    employmentId: internalEmploymentId,

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
     * Current state of the form fields for the current step.
     */
    fieldValues,
    /**
     * Current step state containing the current step and total number of steps
     */
    stepState,
    /**
     * Array of form fields from the onboarding schema
     */
    fields: stepFields[stepState.currentStep.name],
    /**
     * Loading state indicating if the onboarding schema is being fetched
     */
    isLoading: isLoading,
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
    handleValidation: async (
      values: FieldValues,
    ): Promise<ValidationResult | null> => {
      if (stepState.currentStep.name === 'select_country') {
        return selectCountryForm.handleValidation(values);
      }
      if (stepState.currentStep.name === 'benefits' && benefitOffersSchema) {
        const parsedValues = await parseJSFToValidate(
          values,
          benefitOffersSchema?.fields,
          { isPartialValidation: false },
        );

        return benefitOffersSchema?.handleValidation(parsedValues);
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
        contractDetailsForm &&
        stepState.currentStep.name === 'contract_details'
      ) {
        const parsedValues = await parseJSFToValidate(
          values,
          contractDetailsForm?.fields,
          { isPartialValidation: false },
        );
        return contractDetailsForm?.handleValidation(parsedValues);
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

    /**
     * Fields metadata for each step
     */
    meta: {
      fields: fieldsMetaRef.current,
      fieldsets: stepFieldsWithFlatFieldsets[stepState.currentStep.name],
    },

    /**
     * Function to refetch the employment data
     * @returns {void}
     */
    refetchEmployment,
    /**
     * Employment data
     */
    employment,

    /**
     * let's the user know that the employment cannot be edited, happens when employment.status is invited, created_awaiting_reserve or created_reserve_paid
     * @returns {boolean}
     */
    isEmploymentReadOnly,

    /**
     * let's the user know if the company can invite employees
     * @returns {boolean}
     */
    canInvite,
  };
};
