import { useState, useMemo } from 'react';
import { FieldValues } from 'react-hook-form';
import { useEmploymentQuery } from '@/src/common/api/employment';
import { useContractorContractDetailsSchema } from '@/src/common/api/contractor-contract-details';
import { useCreateContractorContractDocument } from '@/src/flows/ContractorOnboarding/api';
import { buildContractDetailsJsfModify } from '@/src/flows/ContractorOnboarding/jsfModify';
import {
  calculateProvisionalStartDateDescription,
  transformAiErrorResponse,
} from '@/src/flows/ContractorOnboarding/utils';
import { mutationToPromise, isMutationError } from '@/src/lib/mutations';
import { parseJSFToValidate } from '@/src/components/form/utils';
import { prettifyFormValues } from '@/src/lib/utils';
import {
  ContractorContractCreationHookProps,
  ContractorContractCreationFlowBag,
} from '@/src/flows/ContractorContractCreation/types';
import { CreateContractDocument } from '@/src/client';

// TODO: Possibly repeated code
type AiValidationError = {
  error: string[];
  source: string;
  skippable: boolean;
};

// TODO: Possibly repeated code
const REMOTE_AI_ERROR_SOURCE = 'remote_ai';

/**
 * Extracts AI validation error from the error response
 * TODO: Possibly repeated code
 */
const extractAiValidationError = (error: unknown): AiValidationError | null => {
  if (!isMutationError(error)) {
    return null;
  }

  const rawError = error.normalizedErrors.services_and_deliverables;

  const servicesAndDeliverablesError = (
    Array.isArray(rawError) ? rawError[0] : rawError
  ) as
    | {
        error: string[];
        source: string;
        skippable: boolean;
      }
    | undefined;

  if (servicesAndDeliverablesError?.source === REMOTE_AI_ERROR_SOURCE) {
    return {
      error: servicesAndDeliverablesError.error,
      source: servicesAndDeliverablesError.source,
      skippable: servicesAndDeliverablesError.skippable,
    };
  }
  return null;
};

/**
 * Headless hook for contractor contract creation flow
 * This hook provides all the logic needed to create a contractor contract
 * without being tied to any specific UI implementation
 * TODO: Things missing on this hook:
 * - Opportunity to use handleValidation to make the mutations instead of the old way...
 */
export const useContractorContractCreation = ({
  employmentId,
  initialValues: providedInitialValues = {},
  jsfModify,
  jsonSchemaVersion,
}: ContractorContractCreationHookProps): ContractorContractCreationFlowBag => {
  const [fieldValues, setFieldValues] = useState<FieldValues>({});

  // Fetch employment data
  const { data: employment, isLoading: isLoadingEmployment } =
    useEmploymentQuery({
      employmentId,
      queryParams: { exclude_files: true },
    });

  // Derive country code from employment
  const countryCode = employment?.country?.code;

  // Get provisional start date from employment
  const provisionalStartDate =
    employment?.basic_information?.provisional_start_date;

  // Calculate provisional start date description
  const provisionalStartDateDescription = useMemo(() => {
    // TODO: how to handle when we're loading the provisional start date?
    return calculateProvisionalStartDateDescription(
      provisionalStartDate,
      fieldValues?.service_duration?.provisional_start_date,
    );
  }, [
    provisionalStartDate,
    fieldValues?.service_duration?.provisional_start_date,
  ]);

  // Build jsfModify with internal modifications
  const mergedJsfModify = useMemo(() => {
    return buildContractDetailsJsfModify(
      jsfModify,
      provisionalStartDateDescription,
      undefined, // selectedPricingPlan - not applicable in standalone contract creation
      fieldValues,
      false, // isContractorOfRecord - not applicable in standalone contract creation
    );
  }, [jsfModify, provisionalStartDateDescription, fieldValues]);

  // Fetch contractor schema
  const { data: contractDetailsForm, isLoading: isLoadingSchema } =
    useContractorContractDetailsSchema({
      countryCode: countryCode as string,
      employmentId,
      fieldValues,
      options: {
        // TODO: We need to correct type...
        jsonSchemaVersion,
        jsfModify: mergedJsfModify,
        queryOptions: { enabled: Boolean(countryCode) },
      },
    });

  // Create contract document mutation
  const createContractDocumentMutation = useCreateContractorContractDocument();
  const { mutateAsyncOrThrow: createContractDocumentMutationAsync } =
    mutationToPromise(createContractDocumentMutation);

  // Initial values from contract details or provided values
  const initialValues = useMemo(() => {
    const employmentContractDetails = employment?.contract_details || {};
    return {
      ...employmentContractDetails,
      ...providedInitialValues,
    };
  }, [employment?.contract_details, providedInitialValues]);

  // Prettified values for display
  const prettifiedValues = useMemo(() => {
    return prettifyFormValues(fieldValues, contractDetailsForm?.fields || []);
  }, [fieldValues, contractDetailsForm?.fields]);

  // Parse form values
  const parseFormValues = async (values: FieldValues) => {
    if (contractDetailsForm) {
      return await parseJSFToValidate(values, contractDetailsForm.fields, {
        isPartialValidation: false,
      });
    }
    return values;
  };

  // Handle validation
  const handleValidation = async (values: FieldValues) => {
    if (contractDetailsForm) {
      const parsedValues = await parseJSFToValidate(
        values,
        contractDetailsForm.fields,
        { isPartialValidation: false },
      );
      return contractDetailsForm.handleValidation(parsedValues);
    }
    return null;
  };

  // Submit handler
  const onSubmit = async (values: FieldValues) => {
    const parsedValues = await parseFormValues(values);

    // Handle AI validation skipping
    const shouldSkipAiChecks =
      fieldValues.services_and_deliverables_error_skippable === true;

    // Remove AI warning fields from submission
    const {
      services_and_deliverables_ai_warning: _aiWarning,
      services_and_deliverables_error_skippable: _errorSkippable,
      ...contractDetailsData
    } = parsedValues;

    const payload: CreateContractDocument = {
      contract_document: contractDetailsData,
      skip_ai_checks: shouldSkipAiChecks,
    };

    try {
      const response = await createContractDocumentMutationAsync({
        employmentId,
        payload,
      });
      return response;
    } catch (error) {
      // Handle AI validation errors
      const aiError = extractAiValidationError(error);
      if (aiError) {
        setFieldValues({
          ...values,
          services_and_deliverables_ai_warning: transformAiErrorResponse(false),
          services_and_deliverables_error_skippable: aiError.skippable,
        });
      }
      throw error;
    }
  };

  return {
    isLoading: isLoadingEmployment || isLoadingSchema,
    fields: contractDetailsForm?.fields || [],
    fieldValues,
    checkFieldUpdates: setFieldValues,
    handleValidation,
    parseFormValues,
    onSubmit,
    initialValues,
    employment,
    canSkipAiValidation:
      fieldValues.services_and_deliverables_error_skippable === true,
    isSubmitting: createContractDocumentMutation.isPending,
    meta: {
      fields: prettifiedValues,
      fieldsets: contractDetailsForm?.meta?.['x-jsf-fieldsets'],
      presentation: contractDetailsForm?.meta?.['x-jsf-presentation'],
    },
  };
};
