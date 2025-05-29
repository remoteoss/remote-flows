import {
  Employment,
  EmploymentCreateParams,
  EmploymentFullParams,
  getShowEmployment,
  getShowFormCountry,
  patchUpdateEmployment2,
  postCreateEmployment2,
  postInviteEmploymentInvitation,
  PostInviteEmploymentInvitationData,
  getShowSchema,
  putUpdateBenefitOffer,
  UnifiedEmploymentUpsertBenefitOffersRequest,
  getIndexBenefitOffer,
  getSupportedCountry,
} from '@/src/client';
import { Client } from '@hey-api/client-fetch';
import {
  createHeadlessForm,
  Fields,
  modify,
} from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from '@/src/context';
import { useStepState } from '@/src/flows/useStepState';
import { prettifyFormValues, STEPS } from '@/src/flows/Onboarding/utils';
import {
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { mutationToPromise } from '@/src/lib/mutations';
import { FieldValues } from 'react-hook-form';
import { OnboardingFlowParams } from '@/src/flows/Onboarding/types';
import { JSONSchemaFormType } from '@/src/flows/types';
import { useRef, useState } from 'react';
import mergeWith from 'lodash/mergeWith';
import { selectCountryStepSchema } from '@/src/flows/Onboarding/json-schemas/selectCountryStep';

type OnboardingHookProps = OnboardingFlowParams;

const jsonSchemaToEmployment: Partial<
  Record<JSONSchemaFormType, keyof Employment>
> = {
  employment_basic_information: 'basic_information',
  contract_details: 'contract_details',
};

const useEmployment = (employmentId: string | undefined) => {
  const { client } = useClient();

  return useQuery({
    queryKey: ['employment', employmentId],
    retry: false,
    enabled: !!employmentId,
    queryFn: async () => {
      const response = await getShowEmployment({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          employment_id: employmentId as string,
        },
      });

      // If response status is 404 or other error, throw an error to trigger isError
      if (response.error || !response.data) {
        throw new Error('Failed to fetch employment data');
      }

      return response;
    },
  });
};

const useBenefitOffers = (employmentId: string | undefined) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['benefit-offers', employmentId],
    retry: false,
    enabled: !!employmentId,
    queryFn: async () => {
      return getIndexBenefitOffer({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          employment_id: employmentId as string,
        },
      }).then((response) => {
        // If response status is 404 or other error, throw an error to trigger isError
        if (response.error || !response.data) {
          throw new Error('Failed to fetch benefit offers data');
        }

        return response;
      });
    },
    select: ({ data }) =>
      data?.data?.reduce(
        (acc, item) => {
          return {
            ...acc,
            [item.benefit_group.slug]: {
              value: item.benefit_tier?.slug ?? '',
            },
          };
        },
        {} as Record<string, { value: string }>,
      ),
  });
};
/**
 * Use this hook to invite an employee to the onboarding flow
 * @returns
 */
export const useEmploymentInvite = () => {
  const { client } = useClient();

  return useMutation({
    mutationFn: (payload: PostInviteEmploymentInvitationData['path']) => {
      return postInviteEmploymentInvitation({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: payload,
      });
    },
  });
};

/**
 * Use this hook to get the JSON schema form for the onboarding flow
 * @param param0
 * @returns
 */
const useJSONSchemaForm = ({
  countryCode,
  form,
  fieldValues,
  options,
  employment,
  enabled,
}: {
  countryCode: string;
  form: JSONSchemaFormType;
  fieldValues: FieldValues;
  options?: OnboardingHookProps['options'];
  employment?: Employment;
  enabled: boolean;
}) => {
  const { client } = useClient();
  const jsonSchemaQueryParam = options?.jsonSchemaVersion?.form_schema?.[form]
    ? {
        json_schema_version: options.jsonSchemaVersion.form_schema[form],
      }
    : {};
  return useQuery({
    queryKey: ['onboarding-json-schema-form', countryCode, form],
    retry: false,
    enabled: enabled,
    queryFn: async () => {
      const response = await getShowFormCountry({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          country_code: countryCode,
          form: form,
        },
        query: {
          skip_benefits: true,
          ...jsonSchemaQueryParam,
        },
      });

      // If response status is 404 or other error, throw an error to trigger isError
      if (response.error || !response.data) {
        throw new Error('Failed to fetch onboarding schema');
      }

      return response;
    },
    select: ({ data }) => {
      let jsfSchema = data?.data || {};
      if (options && options.jsfModify) {
        const { schema } = modify(jsfSchema, options.jsfModify);
        jsfSchema = schema;
      }
      const hasFieldValues = Object.keys(fieldValues).length > 0;
      const employmentField = jsonSchemaToEmployment[form] as keyof Employment;
      const employmentFieldData = (employment?.[employmentField] ||
        {}) as Record<string, unknown>;
      return createHeadlessForm(jsfSchema, {
        initialValues: hasFieldValues ? fieldValues : employmentFieldData,
      });
    },
  });
};

const useBenefitOffersSchema = (
  employmentId: string,
  fieldValues: FieldValues,
  options: OnboardingHookProps['options'],
) => {
  const jsonSchemaQueryParam = options?.jsonSchemaVersion
    ?.benefit_offers_form_schema
    ? {
        json_schema_version:
          options.jsonSchemaVersion.benefit_offers_form_schema,
      }
    : {};
  const { client } = useClient();
  return useQuery({
    queryKey: ['benefit-offers-schema', employmentId],
    retry: false,
    enabled: !!employmentId,
    queryFn: async () => {
      const response = await getShowSchema({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          employment_id: employmentId,
        },
        query: jsonSchemaQueryParam,
      });

      // If response status is 404 or other error, throw an error to trigger isError
      if (response.error || !response.data) {
        throw new Error('Failed to fetch benefit offers schema');
      }

      return response;
    },
    select: ({ data }) => {
      let jsfSchema = data?.data?.schema || {};

      if (options && options.jsfModify) {
        const { schema } = modify(jsfSchema, options.jsfModify);
        jsfSchema = schema;
      }
      const hasFieldValues = Object.keys(fieldValues).length > 0;
      const result = createHeadlessForm(jsfSchema, {
        // we need to clone the fieldValues to prevent side effects
        // if we don't do this, the benefits get included in the other steps
        initialValues: hasFieldValues ? { ...fieldValues } : {},
      });
      return result;
    },
  });
};

/**
 * Use this hook to create an employment
 * @returns
 */
const useCreateEmployment = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (payload: EmploymentCreateParams) => {
      return postCreateEmployment2({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
      });
    },
  });
};

const useUpdateEmployment = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: ({
      employmentId,
      ...payload
    }: EmploymentFullParams & { employmentId: string }) => {
      return patchUpdateEmployment2({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
        path: {
          employment_id: employmentId,
        },
        query: {
          skip_benefits: true,
        },
      });
    },
  });
};

const useUpdateBenefitsOffers = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: ({
      employmentId,
      ...payload
    }: UnifiedEmploymentUpsertBenefitOffersRequest & {
      employmentId: string;
    }) => {
      return putUpdateBenefitOffer({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
        path: {
          employment_id: employmentId,
        },
      });
    },
  });
};

export const useCountries = () => {
  const { client } = useClient();
  return useQuery({
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
        data?.data?.map((country) => {
          return {
            label: country.name,
            value: country.code,
          };
        }) || []
      );
    },
  });
};

export const useOnboarding = ({
  employmentId,
  type,
  options,
}: OnboardingHookProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldsMetaRef = useRef<Record<string, any>>({});
  const [internalEmploymentId, setInternalEmploymentId] = useState<
    string | undefined
  >(employmentId);
  const [internalCountryCode, setInternalCountryCode] = useState<string | null>(
    null,
  );
  const { data: countries, isLoading: isLoadingCountries } = useCountries();
  const { data: employment, isLoading: isLoadingEmployment } =
    useEmployment(employmentId);

  const { data: benefitOffers, isLoading: isLoadingBenefitOffers } =
    useBenefitOffers(internalEmploymentId);
  const {
    fieldValues,
    stepState,
    setFieldValues,
    previousStep,
    nextStep,
    goToStep,
  } = useStepState<keyof typeof STEPS>(STEPS);

  const { schema: selectCountrySchema } = modify(
    selectCountryStepSchema.data.schema,
    options?.jsfModify || {},
  );

  const selectCountryForm = createHeadlessForm(selectCountrySchema);

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

  const form: Record<keyof typeof STEPS, JSONSchemaFormType | null> = {
    select_country: null,
    basic_information: 'employment_basic_information',
    contract_details: 'contract_details',
    benefits: null,
    review: null,
  };

  const { data: onboardingForm, isLoading: isLoadingBasicInformation } =
    useJSONSchemaForm({
      countryCode: internalCountryCode as string,
      form:
        form[stepState.currentStep.name as keyof typeof STEPS] ||
        'employment_basic_information',
      fieldValues: {
        ...stepState.values?.[stepState.currentStep.name as keyof typeof STEPS], // Restore values for the current step
        ...fieldValues,
      },
      options: options,
      employment: employment?.data?.data?.employment,
      enabled: Boolean(
        stepState.currentStep.name !== 'select_country' && internalCountryCode,
      ),
    });

  const {
    data: benefitOffersSchema,
    isLoading: isLoadingBenefitsOffersSchema,
  } = useBenefitOffersSchema(
    internalEmploymentId as string,
    fieldValues,
    options,
  );

  const benefitsFormValues = {
    ...stepState.values?.[stepState.currentStep.name as keyof typeof STEPS], // Restore values for the current step
    ...fieldValues,
  };

  const initialValuesBenefitOffers =
    stepState.currentStep.name === 'benefits'
      ? mergeWith({}, benefitOffers, benefitsFormValues)
      : {};

  const stepFields: Record<keyof typeof STEPS, Fields> = {
    select_country: selectCountryForm?.fields || [],
    basic_information: onboardingForm?.fields || [],
    contract_details: onboardingForm?.fields || [],
    benefits: benefitOffersSchema?.fields || [],
    review: [],
  };

  const initialValues = {
    select_country: getInitialValues(stepFields[stepState.currentStep.name], {
      country: employment?.data.data.employment?.country.code || '',
    }),
    basic_information: getInitialValues(
      stepFields[stepState.currentStep.name],
      employment?.data?.data.employment?.basic_information || {},
    ),
    contract_details: getInitialValues(
      stepFields[stepState.currentStep.name],
      employment?.data?.data.employment?.contract_details || {},
    ),
    benefits: initialValuesBenefitOffers || {},
  };

  if (countries) {
    const countryField = selectCountryForm.fields.find(
      (field) => field.name === 'country',
    );
    if (countryField) {
      countryField.options = countries;
    }
  }

  function parseFormValues(values: FieldValues) {
    if (selectCountryForm && stepState.currentStep.name === 'select_country') {
      return parseJSFToValidate(values, selectCountryForm?.fields, {
        isPartialValidation: true,
      });
    }
    if (onboardingForm && stepState.currentStep.name !== 'select_country') {
      return parseJSFToValidate(values, onboardingForm?.fields, {
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
    switch (stepState.currentStep.name) {
      case 'select_country': {
        setInternalCountryCode(parsedValues.country);
        return Promise.resolve({ data: { countryCode: parsedValues.country } });
      }
      case 'basic_information': {
        if (!internalEmploymentId && internalCountryCode) {
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
    employmentId,
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
    isLoading:
      isLoadingBasicInformation ||
      isLoadingEmployment ||
      isLoadingBenefitsOffersSchema ||
      isLoadingBenefitOffers ||
      isLoadingCountries,
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
        const parsedValues = parseJSFToValidate(
          values,
          selectCountryForm?.fields,
        );
        return selectCountryForm.handleValidation(parsedValues);
      }
      if (stepState.currentStep.name === 'benefits' && benefitOffersSchema) {
        const parsedValues = parseJSFToValidate(
          values,
          benefitOffersSchema?.fields,
        );

        return benefitOffersSchema?.handleValidation(parsedValues);
      }
      if (onboardingForm) {
        const parsedValues = parseJSFToValidate(values, onboardingForm?.fields);

        return onboardingForm?.handleValidation(parsedValues);
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
  };
};
