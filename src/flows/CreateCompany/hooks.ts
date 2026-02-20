import { useMemo, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { JSFFields } from '@/src/types/remoteFlows';
import {
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import { CreateCompanyFlowProps } from '@/src/flows/CreateCompany/types';
import { CreateCompanyParams, UpdateCompanyParams } from '@/src/client';
import { nowUtcFormatted } from '@/src/common/dates';

import { STEPS } from '@/src/flows/CreateCompany/utils';
import {
  useCountriesSchemaField,
  useAddressDetailsSchema,
} from '@/src/flows/CreateCompany/api';
import { Step, useStepState } from '@/src/flows/useStepState';
import { createStructuredError, prettifyFormValues } from '@/src/lib/utils';
import { JSFFieldset, Meta } from '@/src/types/remoteFlows';
import { mutationToPromise } from '@/src/lib/mutations';
import {
  useCreateCompanyRequest,
  useUpdateCompanyRequest,
} from '@/src/flows/CreateCompany/api';

type useCreateCompanyProps = Omit<CreateCompanyFlowProps, 'render'>;

/**
 * Main hook for the CreateCompany flow
 * Manages the two-step flow: company creation and address details
 * @param countryCode - Optional initial country code
 * @param options - Flow options including jsfModify and jsonSchemaVersion
 * @returns CreateCompany bag with all flow state and methods
 */
export const useCreateCompany = ({
  countryCode,
  options,
  initialValues: createCompanyInitialValues,
}: useCreateCompanyProps) => {
  const createCompanyMutation = useCreateCompanyRequest();
  const updateCompanyMutation = useUpdateCompanyRequest();

  const { mutateAsync: createCompanyMutationAsync } = mutationToPromise(
    createCompanyMutation,
  );
  const { mutateAsync: updateCompanyMutationAsync } = mutationToPromise(
    updateCompanyMutation,
  );

  const [internalCountryCode, setInternalCountryCode] = useState<string | null>(
    countryCode || null,
  );
  const [createdCompanyId, setCreatedCompanyId] = useState<string | null>(null);
  const fieldsMetaRef = useRef<{
    company_basic_information: Meta;
    address_details: Meta;
  }>({
    company_basic_information: {},
    address_details: {},
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

  const { companyBasicInformationForm, isLoading: isLoadingCountries } =
    useCountriesSchemaField({
      jsfModify: options?.jsfModify?.company_basic_information,
      queryOptions: {
        enabled: stepState.currentStep.name === 'company_basic_information',
      },
    });

  const { data: addressDetailsForm, isLoading: isLoadingAddressDetails } =
    useAddressDetailsSchema({
      countryCode: internalCountryCode,
      fieldValues:
        stepState.currentStep.name === 'address_details'
          ? {
              ...(stepState.values?.address_details || {}),
              ...fieldValues,
            }
          : stepState.values?.address_details || {},
      options: {
        ...options,
        jsfModify: options?.jsfModify?.address_details,
        queryOptions: {
          enabled:
            stepState.currentStep.name === 'address_details' &&
            !!internalCountryCode &&
            !!createdCompanyId,
        },
      },
    });

  const stepFields: Record<keyof typeof STEPS, JSFFields> = useMemo(
    () => ({
      company_basic_information: companyBasicInformationForm?.fields || [],
      address_details: addressDetailsForm?.fields || [],
    }),
    [companyBasicInformationForm?.fields, addressDetailsForm?.fields],
  );

  const stepFieldsWithFlatFieldsets: Record<
    keyof typeof STEPS,
    JSFFieldset | null | undefined
  > = {
    company_basic_information: null,
    address_details: addressDetailsForm?.meta?.['x-jsf-fieldsets'] || null,
  };

  const companyBasicInformationInitialValues = useMemo(
    () =>
      getInitialValues(stepFields.company_basic_information, {
        ...createCompanyInitialValues,
        country_code:
          internalCountryCode || createCompanyInitialValues?.country_code || '',
      }),
    [
      stepFields.company_basic_information,
      internalCountryCode,
      createCompanyInitialValues,
    ],
  );

  const addressDetailsInitialValues = useMemo(
    () =>
      getInitialValues(
        stepFields.address_details,
        createCompanyInitialValues || {},
      ),
    [stepFields.address_details, createCompanyInitialValues],
  );

  const initialValues = useMemo(() => {
    return {
      company_basic_information: companyBasicInformationInitialValues,
      address_details: addressDetailsInitialValues,
    };
  }, [companyBasicInformationInitialValues, addressDetailsInitialValues]);

  const goTo = (step: keyof typeof STEPS) => {
    goToStep(step);
  };

  const parseFormValues = async (values: FieldValues) => {
    const currentStepName = stepState.currentStep.name;
    const currentStepFields = stepFields[currentStepName];

    if (
      companyBasicInformationForm &&
      currentStepName === 'company_basic_information'
    ) {
      return await parseJSFToValidate(values, currentStepFields, {
        isPartialValidation: false,
      });
    }
    if (addressDetailsForm && currentStepName === 'address_details') {
      return await parseJSFToValidate(values, currentStepFields, {
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
    const parsedValues = await parseFormValues(values);
    switch (stepState.currentStep.name) {
      case 'company_basic_information': {
        setInternalCountryCode(parsedValues.country_code);

        // If company already exists, skip creation and return current form values
        if (createdCompanyId) {
          return Promise.resolve({
            data: {
              countryCode: parsedValues.country_code ?? '',
              companyOwnerEmail: parsedValues.company_owner_email ?? '',
              companyOwnerName: parsedValues.company_owner_name ?? '',
              desiredCurrency: parsedValues.desired_currency ?? '',
              name: parsedValues.name ?? '',
              phoneNumber: parsedValues.phone_number ?? '',
              taxNumber: parsedValues.tax_number ?? '',
            },
          });
        }

        const payload: CreateCompanyParams = {
          country_code: parsedValues.country_code,
          company_owner_email: parsedValues.company_owner_email,
          company_owner_name: parsedValues.company_owner_name,
          desired_currency: parsedValues.desired_currency,
          name: parsedValues.name,
          phone_number: parsedValues.phone_number,
          tax_number: parsedValues.tax_number,
          terms_of_service_accepted_at: nowUtcFormatted(),
        };

        const response = await createCompanyMutationAsync(payload);

        // Check for errors from the mutation
        if (response.error) {
          return Promise.resolve({
            data: null,
            error: response.error,
            rawError: response.rawError,
            fieldErrors: response.fieldErrors,
          });
        }

        // Handle both CompanyResponse and CompanyWithTokensResponse structures
        // CompanyResponse: { data: { company?: Company } }
        // CompanyWithTokensResponse: { company?: Company; tokens?: OAuth2Tokens }
        const responseData = response.data?.data;
        let companyId: string | undefined;
        let company:
          | {
              country_code?: string;
              company_owner_email?: string;
              company_owner_name?: string;
              desired_currency?: string;
              name?: string;
              phone_number?: string;
              tax_number?: string;
            }
          | undefined;
        if (responseData) {
          if ('data' in responseData && responseData.data) {
            // CompanyResponse structure: response.data.data.data.company
            const companyData = (responseData.data as { company?: unknown })
              .company;
            company = companyData as typeof company;
            companyId = (companyData as { id?: string })?.id;
          } else if ('company' in responseData) {
            // CompanyWithTokensResponse structure: response.data.data.company
            company = responseData.company as typeof company;
            companyId = (company as { id?: string })?.id;
          }
        }
        if (companyId) {
          setCreatedCompanyId(companyId);
        }
        // Map company fields from snake_case to camelCase to match CompanyBasicInfoSuccess
        // Fall back to parsedValues if company data is not available
        return Promise.resolve({
          data: {
            countryCode:
              company?.country_code ?? parsedValues.country_code ?? '',
            companyOwnerEmail:
              company?.company_owner_email ??
              parsedValues.company_owner_email ??
              '',
            companyOwnerName:
              company?.company_owner_name ??
              parsedValues.company_owner_name ??
              '',
            desiredCurrency:
              company?.desired_currency ?? parsedValues.desired_currency ?? '',
            name: company?.name ?? parsedValues.name ?? '',
            phoneNumber:
              company?.phone_number ?? parsedValues.phone_number ?? '',
            taxNumber: company?.tax_number ?? parsedValues.tax_number ?? '',
          },
        });
      }

      case 'address_details': {
        if (!createdCompanyId) {
          throw createStructuredError(
            'Company ID is required to update address details',
          );
        }
        const payload: UpdateCompanyParams = {
          address_details: parsedValues,
        };

        const response = await updateCompanyMutationAsync({
          companyId: createdCompanyId,
          payload,
          jsonSchemaVersion:
            options?.jsonSchemaVersion?.form_schema?.address_details,
        });

        // Check for errors from the mutation
        if (response.error) {
          return Promise.resolve({
            data: null,
            error: response.error,
            rawError: response.rawError,
            fieldErrors: response.fieldErrors,
          });
        }

        return Promise.resolve({ data: response.data });
      }

      default: {
        throw createStructuredError('Invalid step state');
      }
    }
  }

  const isLoading = isLoadingCountries || isLoadingAddressDetails;

  return {
    /**
     * Loading state indicating if the flow is loading data
     */
    isLoading,

    /**
     * Loading state indicating if the company creation or update mutation is in progress
     */
    isSubmitting:
      createCompanyMutation.isPending || updateCompanyMutation.isPending,

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
      if (
        stepState.currentStep.name === 'company_basic_information' &&
        companyBasicInformationForm
      ) {
        const parsedValues = await parseJSFToValidate(
          values,
          companyBasicInformationForm.fields,
          { isPartialValidation: false },
        );
        return companyBasicInformationForm.handleValidation(parsedValues);
      }
      if (
        stepState.currentStep.name === 'address_details' &&
        addressDetailsForm
      ) {
        const parsedValues = await parseJSFToValidate(
          values,
          addressDetailsForm.fields,
          { isPartialValidation: false },
        );
        return addressDetailsForm.handleValidation(parsedValues);
      }

      return null;
    },

    /**
     * Initial form values
     */
    initialValues,
  };
};
