import {
  Employment,
  EmploymentCreateParams,
  EmploymentFullParams,
} from '@/src/client';
import { Fields } from '@remoteoss/json-schema-form';

import { useStepState, Step } from '@/src/flows/useStepState';
import {
  prettifyFormValues,
  STEPS,
  STEPS_WITHOUT_SELECT_COUNTRY,
} from '@/src/flows/Onboarding/utils';
import {
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { mutationToPromise } from '@/src/lib/mutations';
import { FieldValues } from 'react-hook-form';
import { OnboardingFlowParams } from '@/src/flows/Onboarding/types';
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
import { JSONSchemaFormType } from '@/src/flows/types';

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

const reviewStepAllowedEmploymentStatus: Employment['status'][] = [
  'invited',
  'created_awaiting_reserve',
  'created_reserve_paid',
];

export const useOnboarding = ({
  employmentId,
  companyId,
  countryCode,
  type,
  options,
}: OnboardingHookProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldsMetaRef = useRef<Record<string, any>>({});
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
  const stepsToUse = countryCode ? STEPS_WITHOUT_SELECT_COUNTRY : STEPS;

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
    useCountriesSchemaField(options);

  const createEmploymentMutation = useCreateEmployment();
  const updateEmploymentMutation = useUpdateEmployment();
  const updateBenefitsOffersMutation = useUpdateBenefitsOffers();
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

  const isOnboardingFormEnabled = Boolean(
    internalCountryCode &&
      (stepState.currentStep.name === 'basic_information' ||
        stepState.currentStep.name === 'contract_details' ||
        Boolean(employmentId)),
  );

  const useJSONSchema = ({ form }: { form: JSONSchemaFormType }) => {
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
        ...options,
        queryOptions: {
          enabled: isOnboardingFormEnabled,
        },
      },
    });
  };

  const {
    data: basicInformationForm,
    isLoading: isLoadingBasicInformationForm,
  } = useJSONSchema({
    form: 'employment_basic_information',
  });

  const { data: contractDetailsForm, isLoading: isLoadingContractDetailsForm } =
    useJSONSchema({
      form: 'contract_details',
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

  const initialValues = {
    select_country: getInitialValues(stepFields[stepState.currentStep.name], {
      country: internalCountryCode || employment?.country.code || '',
    }),
    basic_information: getInitialValues(
      stepFields[stepState.currentStep.name],
      employment?.basic_information || {},
    ),
    contract_details: getInitialValues(
      stepFields[stepState.currentStep.name],
      employment?.contract_details || {},
    ),
    benefits: initialValuesBenefitOffers || {},
  };

  const initialLoading =
    isLoadingBasicInformationForm ||
    isLoadingContractDetailsForm ||
    isLoadingEmployment ||
    isLoadingBenefitsOffersSchema ||
    isLoadingBenefitOffers ||
    isLoadingCompany ||
    isLoadingCountries;

  const isNavigatingToReview = Boolean(
    employmentId &&
      employment &&
      reviewStepAllowedEmploymentStatus.includes(employment?.status) &&
      !initialLoading &&
      stepFields['basic_information'].length > 0 &&
      stepFields['contract_details'].length > 0 &&
      stepState.currentStep.name !== 'review',
  );

  useEffect(() => {
    if (isNavigatingToReview) {
      const selectCountryInitialValues = getInitialValues(
        stepFields['select_country'],
        {
          country: internalCountryCode || employment?.country.code || '',
        },
      );

      const basicInformationInitialValues = getInitialValues(
        stepFields['basic_information'],
        employment?.basic_information || {},
      );

      const contractDetailsInitialValues = getInitialValues(
        stepFields['contract_details'],
        employment?.contract_details || {},
      );

      const benefitsInitialValues = getInitialValues(
        stepFields['benefits'],
        initialValuesBenefitOffers || {},
      );
      fieldsMetaRef.current = {
        select_country: prettifyFormValues(
          selectCountryInitialValues,
          stepFields['select_country'],
        ),
        basic_information: prettifyFormValues(
          basicInformationInitialValues,
          stepFields['basic_information'],
        ),
        contract_details: prettifyFormValues(
          contractDetailsInitialValues,
          stepFields['contract_details'],
        ),
        benefits: prettifyFormValues(
          benefitsInitialValues,
          stepFields['benefits'],
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
    employmentId,
    employment,
    initialLoading,
    internalCountryCode,
    goToStep,
    initialValuesBenefitOffers,
    stepFields,
    stepState.currentStep.name,
    setStepValues,
    isNavigatingToReview,
  ]);

  const isLoading = initialLoading || isNavigatingToReview;

  function parseFormValues(values: FieldValues) {
    if (selectCountryForm && stepState.currentStep.name === 'select_country') {
      return values;
    }
    if (
      basicInformationForm &&
      stepState.currentStep.name === 'basic_information'
    ) {
      return parseJSFToValidate(values, basicInformationForm?.fields, {
        isPartialValidation: true,
      });
    }

    if (
      contractDetailsForm &&
      stepState.currentStep.name === 'contract_details'
    ) {
      return parseJSFToValidate(values, contractDetailsForm?.fields, {
        isPartialValidation: true,
      });
    }

    return {};
  }

  async function onSubmit(values: FieldValues) {
    // Prettify values for the current step
    fieldsMetaRef.current[stepState.currentStep.name] = prettifyFormValues(
      values,
      stepFields[stepState.currentStep.name],
    );

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
            await refetchCompany();
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

    owner_id: company?.company_owner_user_id,
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
  };
};
