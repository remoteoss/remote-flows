import { useMemo, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import {  useQuery } from '@tanstack/react-query';
import { JSFFields } from '@/src/types/remoteFlows';
import { Client } from '@/src/client/client';
import {
  getInitialValues,
} from '@/src/components/form/utils';
import {
  FlowOptions,
} from '@/src/flows/types';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import { CreateCompanyFlowProps } from '@/src/flows/CreateCompany/types';
import {
  CreateCompanyParams,
  getShowFormCountry,
  UpdateCompanyParams,
} from '@/src/client';

import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { useClient } from '@/src/context';
import { selectCountryStepSchema } from '@/src/flows/CreateCompany/json-schemas/selectCountryStep';
import {
  STEPS,
} from '@/src/flows/CreateCompany/utils';
import {
  getSupportedCountry,
  getIndexCompanyCurrency,
} from '@/src/client';

import { Step, useStepState } from '@/src/flows/useStepState';
import { createStructuredError, prettifyFormValues } from '@/src/lib/utils';
import { JSFFieldset, Meta } from '@/src/types/remoteFlows';
import { mutationToPromise } from '@/src/lib/mutations';
import {
  useCreateCompanyRequest,
  useUpdateCompanyRequest,
} from '@/src/flows/CreateCompany/api';

type useCreateCompanyProps = Omit<
  CreateCompanyFlowProps,
  'render'
>;

const useCountries = (queryOptions?: { enabled?: boolean }) => {
  const { client } = useClient();
  return useQuery({
    ...queryOptions,
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
        data?.data
          ?.filter((country) => country.eor_onboarding)
          .map((country) => {
            return {
              label: country.name,
              value: country.code,
            };
          }) || []
      );
    },
  });
};
const useCompanyCurrencies = (queryOptions?: { enabled?: boolean }) => {
  const { client } = useClient();
  return useQuery({
    ...queryOptions,
    queryKey: ['company-currencies'],
    retry: false,
    queryFn: async () => {
      const response = await getIndexCompanyCurrency({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
      });

      if (response.error || !response.data) {
        throw new Error('Failed to fetch company currencies');
      }

      return response;
    },
    select: ({ data }) => {
      return (
        data?.data?.company_currencies.map((currency) => ({
          value: currency.code,
          label: currency.code,
        })) || []
      );
    },
  });
};

const useCountriesSchemaField = (
  options?: Omit<FlowOptions, 'jsonSchemaVersion'> & {
    queryOptions?: { enabled?: boolean };
  },
) => {
  const { data: countries, isLoading: isLoadingCountries } = useCountries(options?.queryOptions);
  const { data: currencies, isLoading: isLoadingCurrencies } = useCompanyCurrencies(options?.queryOptions);

  const selectCountryForm = createHeadlessForm(
    selectCountryStepSchema.data.schema,
    {},
    options,
  );

  if (countries) {
    const countryField = selectCountryForm.fields.find(
      (field) => field.name === 'country_code',
    );
    if (countryField) {
      countryField.options = countries;
    }
  }

  if (currencies) {
    const currencyField = selectCountryForm.fields.find(
      (field) => field.name === 'desired_currency',
    );
    if (currencyField) {
      currencyField.options = currencies;
    }
  }

  return {
    isLoading: isLoadingCountries || isLoadingCurrencies,
    selectCountryForm,
  };
};


function nowUtcFormatted() {
  const now = new Date();

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    now.getUTCFullYear() + '-' +
    pad(now.getUTCMonth() + 1) + '-' +
    pad(now.getUTCDate()) + ' ' +
    pad(now.getUTCHours()) + ':' +
    pad(now.getUTCMinutes()) + ':' +
    pad(now.getUTCSeconds()) + 'Z'
  );
}
const useAddressDetailsSchema = ({
  countryCode,
  fieldValues,
  options,
}: {
  countryCode: string | null;
  fieldValues: FieldValues;
  options?: FlowOptions & { queryOptions?: { enabled?: boolean } };
}) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['company-address-details-schema', countryCode],
    retry: false,
    queryFn: async () => {
      if (!countryCode) {
        throw new Error('Country code is required');
      }
      const response = await getShowFormCountry({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: {
          country_code: countryCode,
          form: 'address_details',
        },
        query: {
          json_schema_version: options?.jsonSchemaVersion?.form_schema?.address_details || 'latest',
        },
      });

      if (response.error || !response.data) {
        throw new Error('Failed to fetch address details schema');
      }

      return response;
    },
    enabled: options?.queryOptions?.enabled && !!countryCode,
    select: ({ data }) => {
      const jsfSchema = data?.data || {};
      return createHeadlessForm(jsfSchema, fieldValues, options);
    },
  });
};

export const useCreateCompany = ({
  countryCode,
  options,
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
    select_country: Meta;
    address_details: Meta;
  }>({
    select_country: {},
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


  const { selectCountryForm, isLoading: isLoadingCountries } =
    useCountriesSchemaField({
      jsfModify: options?.jsfModify?.select_country,
      queryOptions: {
        enabled: stepState.currentStep.name === 'select_country',
      },
    });

  const { data: addressDetailsForm, isLoading: isLoadingAddressDetails } =
    useAddressDetailsSchema({
      countryCode: internalCountryCode,
      fieldValues: fieldValues.address_details || {},
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
      select_country: selectCountryForm?.fields || [],
      address_details: addressDetailsForm?.fields || [],
    }),
    [
      selectCountryForm?.fields,
      addressDetailsForm?.fields,
    ],
  );

  const stepFieldsWithFlatFieldsets: Record<
    keyof typeof STEPS,
    JSFFieldset | null | undefined
  > = {
    select_country: null,
    address_details: addressDetailsForm?.meta?.['x-jsf-fieldsets'] || null,
  };


  const selectCountryInitialValues = useMemo(
    () =>
      getInitialValues(stepFields.select_country, {
        country: internalCountryCode || '',
      }),
    [stepFields.select_country, internalCountryCode],
  );

  const addressDetailsInitialValues = useMemo(
    () =>
      getInitialValues(stepFields.address_details, {}),
    [stepFields.address_details],
  );

  const initialValues = useMemo(() => {
    return {
      select_country: selectCountryInitialValues,
      address_details: addressDetailsInitialValues,
    };
  }, [
    selectCountryInitialValues,
    addressDetailsInitialValues,
  ]);

  const goTo = (step: keyof typeof STEPS) => {
    goToStep(step);
  };

  const parseFormValues = async (values: FieldValues) => {
    if (selectCountryForm && stepState.currentStep.name === 'select_country') {
      return values;
    }
    if (addressDetailsForm && stepState.currentStep.name === 'address_details') {
      return values;
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
        setInternalCountryCode(parsedValues.country_code);
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
        if (responseData) {
          if ('data' in responseData && responseData.data) {
            // CompanyResponse structure: response.data.data.data.company.id
            companyId = (responseData.data as { company?: { id: string } }).company?.id;
          } else if ('company' in responseData) {
            // CompanyWithTokensResponse structure: response.data.data.company.id
            companyId = (responseData as { company?: { id: string } }).company?.id;
          }
        }
        if (companyId) {
          setCreatedCompanyId(companyId);
        }
        return Promise.resolve({ data: { countryCode: parsedValues.country_code } });
      }

      case 'address_details': {
        if (!createdCompanyId) {
          throw createStructuredError('Company ID is required to update address details');
        }
        const payload: UpdateCompanyParams = {
          address_details: parsedValues,
        };

        const response = await updateCompanyMutationAsync({
          companyId: createdCompanyId,
          payload,
          jsonSchemaVersion: options?.jsonSchemaVersion?.form_schema?.address_details,
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

  const isLoading =
    isLoadingCountries || isLoadingAddressDetails

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
      if (stepState.currentStep.name === 'address_details' && addressDetailsForm) {
        return addressDetailsForm.handleValidation(values);
      }

      return null;
    },

    /**
     * Initial form values
     */
    initialValues,
  };
};
