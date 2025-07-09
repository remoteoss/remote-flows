import {
  Employment,
  EmploymentCreateParams,
  EmploymentFullParams,
} from '@/src/client';
import { Fields } from '@remoteoss/json-schema-form';

import { useStepState, Step } from '@/src/flows/useStepState';
import {
  prettifyFormValues,
  reviewStepAllowedEmploymentStatus,
  STEPS,
  STEPS_WITHOUT_SELECT_COUNTRY,
} from '@/src/flows/Onboarding/utils';
import {
  flattenFieldsetValues,
  getInitialValues,
  groupFlatDataIntoFieldsets,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { mutationToPromise } from '@/src/lib/mutations';
import { FieldValues } from 'react-hook-form';
import { Meta, OnboardingFlowParams } from '@/src/flows/Onboarding/types';
import { useEffect, useMemo, useRef, useState } from 'react';
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
} from '@/src/flows/Onboarding/api';
import { JSFModify, JSONSchemaFormType } from '@/src/flows/types';
import { AnnualGrossSalary } from '@/src/flows/Onboarding/components/AnnualGrossSalary';
import { JSFField } from '@/src/types/remoteFlows';

type OnboardingHookProps = OnboardingFlowParams;

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

  return { isLoading, isNavigatingToReview, isEmploymentReadOnly };
};

export const useOnboarding = ({
  employmentId,
  companyId,
  countryCode,
  type,
  options,
  skipSteps,
}: OnboardingHookProps) => {
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
  if (
    employment?.country?.code &&
    internalCountryCode !== employment.country.code
  ) {
    setInternalCountryCode(employment.country.code);
  }

  const { data: benefitOffers, isLoading: isLoadingBenefitOffers } =
    useBenefitOffers(internalEmploymentId);
  const {
    data: company,
    isLoading: isLoadingCompany,
    refetch: refetchCompany,
  } = useCompany(companyId);
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

  const { selectCountryForm, isLoading: isLoadingCountries } =
    useCountriesSchemaField({
      jsfModify: options?.jsfModify?.select_country,
      jsonSchemaVersion: options?.jsonSchemaVersion,
      queryOptions: {
        enabled: stepState.currentStep.name === 'select_country',
      },
    });

  const createEmploymentMutation = useCreateEmployment(options);
  const updateEmploymentMutation = useUpdateEmployment(options);
  const updateBenefitsOffersMutation = useUpdateBenefitsOffers(options);
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
  }: {
    form: JSONSchemaFormType;
    options?: {
      jsfModify?: JSFModify;
      queryOptions?: { enabled?: boolean };
    };
  }) => {
    return useJSONSchemaForm({
      countryCode: internalCountryCode as string,
      form: form,
      fieldValues:
        Object.keys(fieldValues).length > 0
          ? {
              ...stepState.values?.[stepState.currentStep.name], // Restore values for the current step
              ...fieldValues,
            }
          : serverEmploymentData,
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

  const customFields = useMemo(
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
            Component: (props: JSFField & { currency: string }) => (
              <AnnualGrossSalary
                desiredCurrency={company?.desired_currency || ''}
                {...props}
              />
            ),
          },
        },
      },
    }),
    [
      company?.desired_currency,
      annualSalaryFieldPresentation,
      annualGrossSalaryField,
    ],
  );

  const { data: contractDetailsForm, isLoading: isLoadingContractDetailsForm } =
    useJSONSchema({
      form: 'contract_details',
      options: {
        jsfModify: {
          ...options?.jsfModify?.contract_details,
          fields: {
            ...options?.jsfModify?.contract_details?.fields,
            ...customFields.fields,
          },
        },
        queryOptions: {
          enabled: isContractDetailsEnabled,
        },
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

  const {
    country: { code: employmentCountryCode } = {},
    basic_information: employmentBasicInformation = {},
    contract_details: employmentContractDetails = {},
    status: employmentStatus,
  } = employment || {};
  const currentStepName = stepState.currentStep.name;

  const selectCountryInitialValues = useMemo(
    () =>
      getInitialValues(stepFields.select_country, {
        country: internalCountryCode || employmentCountryCode || '',
      }),
    [stepFields.select_country, internalCountryCode, employmentCountryCode],
  );

  const basicInformationInitialValues = useMemo(
    () =>
      getInitialValues(
        stepFields.basic_information,
        employmentBasicInformation || {},
      ),
    [stepFields.basic_information, employmentBasicInformation],
  );

  const contractDetailsInitialValues = useMemo(() => {
    const flatData = flattenFieldsetValues(employmentContractDetails);
    const groupedData = groupFlatDataIntoFieldsets(
      flatData,
      stepFields.contract_details,
    );
    return getInitialValues(stepFields.contract_details, groupedData);
  }, [stepFields.contract_details, employmentContractDetails]);

  const benefitsInitialValues = useMemo(
    () => getInitialValues(stepFields.benefits, initialValuesBenefitOffers),
    [stepFields.benefits, initialValuesBenefitOffers],
  );

  const initialValues = useMemo(
    () => ({
      select_country: selectCountryInitialValues,
      basic_information: basicInformationInitialValues,
      contract_details: contractDetailsInitialValues,
      benefits: benefitsInitialValues,
    }),
    [
      selectCountryInitialValues,
      basicInformationInitialValues,
      contractDetailsInitialValues,
      benefitsInitialValues,
    ],
  );

  const { isLoading, isNavigatingToReview, isEmploymentReadOnly } = useMemo(
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

  const parseFormValues = (values: FieldValues) => {
    let parsedValues: FieldValues = {};
    if (selectCountryForm && stepState.currentStep.name === 'select_country') {
      parsedValues = values;
    }
    if (
      basicInformationForm &&
      stepState.currentStep.name === 'basic_information'
    ) {
      parsedValues = parseJSFToValidate(values, basicInformationForm?.fields, {
        isPartialValidation: true,
      });
    }

    if (
      contractDetailsForm &&
      stepState.currentStep.name === 'contract_details'
    ) {
      parsedValues = parseJSFToValidate(values, contractDetailsForm?.fields, {
        isPartialValidation: true,
      });
    }

    return flattenFieldsetValues(parsedValues);
  };

  async function onSubmit(values: FieldValues) {
    // Prettify values for the current step
    const currentStepName = stepState.currentStep.name;
    if (currentStepName in fieldsMetaRef.current) {
      fieldsMetaRef.current[
        currentStepName as keyof typeof fieldsMetaRef.current
      ] = prettifyFormValues(values, stepFields[currentStepName]);
    }

    const parsedValues = parseFormValues(values);
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
        } else if (internalEmploymentId) {
          return updateEmploymentMutationAsync({
            employmentId: internalEmploymentId,
            basic_information: parsedValues,
            pricing_plan_details: {
              frequency: 'monthly',
            },
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
    handleValidation: (values: FieldValues) => {
      if (stepState.currentStep.name === 'select_country') {
        return selectCountryForm.handleValidation(values);
      }
      if (stepState.currentStep.name === 'benefits' && benefitOffersSchema) {
        const parsedValues = parseJSFToValidate(
          values,
          benefitOffersSchema?.fields,
        );

        return benefitOffersSchema?.handleValidation(parsedValues);
      }
      if (
        basicInformationForm &&
        stepState.currentStep.name === 'basic_information'
      ) {
        const parsedValues = parseJSFToValidate(
          values,
          basicInformationForm?.fields,
        );
        return basicInformationForm?.handleValidation(parsedValues);
      }

      if (
        contractDetailsForm &&
        stepState.currentStep.name === 'contract_details'
      ) {
        const parsedValues = parseJSFToValidate(
          values,
          contractDetailsForm?.fields,
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
  };
};
