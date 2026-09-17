import { useCallback, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';
import {
  Fields,
  ValidationResult,
} from '@remoteoss/remote-json-schema-form-kit';
import { Client } from '@/src/client/client';
import { useEmploymentQuery } from '@/src/common/api/employment';
import { useContractorContractDetailsSchema } from '@/src/common/api/contractor-contract-details';
import {
  contractDocumentsOptions,
  useCreateContractorContractDocument,
} from '@/src/common/contract-documents/api';
import { corProductIdentifier } from '@/src/common/contract-documents/constants';
import { buildContractDetailsJsfModify } from '@/src/common/contract-documents/jsfModify';
import {
  calculateProvisionalStartDateDescription,
  extractAiValidationError,
  transformAiErrorResponse,
} from '@/src/common/contract-documents/utils';
import {
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { useClient } from '@/src/context';
import {
  ContractDocumentContractDetailsPayload,
  ContractDocumentStepKeys,
  UseContractDocumentOptions,
} from '@/src/flows/ContractDocument/types';
import {
  getProductIdentifier,
  STEPS,
  STEPS_ARRAY,
} from '@/src/flows/ContractDocument/utils';
import { useStepState } from '@/src/flows/useStepState';
import { mutationToPromise } from '@/src/lib/mutations';
import { createStructuredError, prettifyFormValues } from '@/src/lib/utils';
import { NestedMeta } from '@/src/types/remoteFlows';

/**
 * Headless hook powering the standalone contract-document flow: the contract details and
 * contract preview screens of contractor onboarding, mountable on their own for the
 * contractor named by `employmentId`.
 */
export const useContractDocument = ({
  employmentId,
  options,
}: UseContractDocumentOptions) => {
  const { client } = useClient();
  const {
    fieldValues,
    setFieldValues,
    stepState,
    nextStep,
    previousStep,
    goToStep,
  } = useStepState<ContractDocumentStepKeys>(STEPS);
  const [contractDocumentId, setContractDocumentId] = useState<
    string | undefined
  >(undefined);
  const fieldsMetaRef = useRef<NestedMeta>({});

  const { data: employment, isLoading: isLoadingEmployment } =
    useEmploymentQuery({
      employmentId,
      queryParams: { exclude_files: true },
      enabled: Boolean(employmentId),
    });

  const { data: contractDocuments, isLoading: isLoadingContractDocuments } =
    useQuery({
      ...contractDocumentsOptions(client as Client, employmentId),
      enabled: Boolean(employmentId),
      select: ({ data }) => data.data.contract_documents,
    });

  const countryCode = employment?.country?.code;
  const productIdentifier = getProductIdentifier(employment?.contractor_type);
  const isContractorOfRecord = productIdentifier === corProductIdentifier;

  const provisionalStartDateDescription =
    calculateProvisionalStartDateDescription(
      employment?.basic_information?.provisional_start_date as
        | string
        | undefined,
      fieldValues?.service_duration?.provisional_start_date,
      "the contractor's current start date",
    );

  const { data: contractDetailsForm, isLoading: isLoadingContractDetailsForm } =
    useContractorContractDetailsSchema({
      countryCode: countryCode as string,
      employmentId,
      fieldValues,
      options: {
        queryOptions: { enabled: Boolean(countryCode) },
        jsfModify: buildContractDetailsJsfModify(
          options?.jsfModify?.contract_details,
          provisionalStartDateDescription,
          productIdentifier,
          fieldValues,
          isContractorOfRecord,
        ),
      },
    });

  const contractDetailsFields = useMemo(
    () => (contractDetailsForm?.fields ?? []) as Fields,
    [contractDetailsForm?.fields],
  );

  const contractDetailsInitialValues = useMemo(
    () =>
      getInitialValues(contractDetailsFields, {
        service_duration: {
          provisional_start_date:
            employment?.basic_information?.provisional_start_date,
        },
        ...employment?.contract_details,
      }),
    [
      contractDetailsFields,
      employment?.basic_information?.provisional_start_date,
      employment?.contract_details,
    ],
  );

  const createContractDocumentMutation = useCreateContractorContractDocument();
  const { mutateAsyncOrThrow: createContractDocument } = mutationToPromise(
    createContractDocumentMutation,
  );

  const checkFieldUpdates = useCallback(
    (values: FieldValues) => {
      setFieldValues(values);
    },
    [setFieldValues],
  );

  const handleValidation = useCallback(
    async (values: FieldValues): Promise<ValidationResult | null> => {
      if (!contractDetailsForm) return null;

      const parsed = await parseJSFToValidate(
        values,
        contractDetailsForm.fields,
        { isPartialValidation: false },
      );

      return contractDetailsForm.handleValidation(parsed) ?? null;
    },
    [contractDetailsForm],
  );

  const parseContractDetails = useCallback(
    (values: FieldValues) =>
      parseJSFToValidate(values, contractDetailsFields, {
        isPartialValidation: false,
      }),
    [contractDetailsFields],
  );

  const buildPayload = useCallback(
    (parsedValues: FieldValues): ContractDocumentContractDetailsPayload => {
      const {
        services_and_deliverables_ai_warning: _aiWarning,
        services_and_deliverables_error_skippable: _errorSkippable,
        ...contractDetails
      } = parsedValues;

      return {
        contract_document: contractDetails,
        skip_ai_checks:
          fieldValues.services_and_deliverables_error_skippable === true,
      };
    },
    [fieldValues.services_and_deliverables_error_skippable],
  );

  const parseFormValues = useCallback(
    async (values: FieldValues) =>
      buildPayload(await parseContractDetails(values)),
    [buildPayload, parseContractDetails],
  );

  const onSubmit = useCallback(
    async (values: FieldValues) => {
      if (!employmentId) {
        throw createStructuredError(
          'No contractor to act on. Pass a non-empty `employmentId` to the flow.',
        );
      }

      const parsedValues = await parseContractDetails(values);
      fieldsMetaRef.current = prettifyFormValues(
        parsedValues,
        contractDetailsFields,
      );
      const payload = buildPayload(parsedValues);

      try {
        const response = await createContractDocument({
          employmentId,
          payload,
        });
        const createdId = response?.data?.contract_document?.id;
        if (!createdId) {
          throw createStructuredError('Contract document ID not found');
        }
        setContractDocumentId(createdId);

        return response;
      } catch (error) {
        const aiError = extractAiValidationError(error);
        if (aiError) {
          setFieldValues({
            ...values,
            services_and_deliverables_ai_warning:
              transformAiErrorResponse(isContractorOfRecord),
            services_and_deliverables_error_skippable: aiError.skippable,
          });
        }

        throw error;
      }
    },
    [
      employmentId,
      parseContractDetails,
      contractDetailsFields,
      buildPayload,
      createContractDocument,
      setFieldValues,
      isContractorOfRecord,
    ],
  );

  const isContractDetailsStep =
    stepState.currentStep.name === 'contract_details';

  return {
    /**
     * Current step state containing the current step and total number of steps.
     */
    stepState,
    /**
     * Every step of the flow, in order.
     */
    steps: STEPS_ARRAY,
    /**
     * Moves to the next step.
     */
    next: nextStep,
    /**
     * Moves to the previous step.
     */
    back: previousStep,
    /**
     * Moves to a specific step.
     */
    goTo: goToStep,
    /**
     * Form fields for the current step.
     */
    fields: isContractDetailsStep ? contractDetailsFields : ([] as Fields),
    /**
     * Current values of the form fields for the current step.
     */
    fieldValues,
    /**
     * Feed the latest form values back in so conditional fields re-evaluate.
     */
    checkFieldUpdates,
    /**
     * Validation handler for the current step's form.
     */
    handleValidation,
    /**
     * Turns the contract details form values into the API payload without submitting.
     */
    parseFormValues,
    /**
     * Creates the contract document from the contract details form values.
     */
    onSubmit,
    /**
     * Initial values per step.
     */
    initialValues: {
      contract_details: contractDetailsInitialValues,
    },
    /**
     * Field metadata per step, for building error messages and rendering fieldsets.
     */
    meta: {
      fields: fieldsMetaRef.current,
      fieldsets: isContractDetailsStep
        ? contractDetailsForm?.meta?.['x-jsf-fieldsets']
        : undefined,
    },
    /**
     * The contractor the contract document will be created for.
     */
    employmentId,
    /**
     * The contractor's employment.
     */
    employment,
    /**
     * Whether the contractor is a Contractor of Record.
     */
    isContractorOfRecord,
    /**
     * The product the contractor is on, read off the employment.
     */
    productIdentifier,
    /**
     * The contract documents the contractor already has. `undefined` until they have
     * loaded, or when loading them failed.
     */
    contractDocuments,
    /**
     * The contract document created in this flow, once there is one.
     */
    contractDocumentId,
    /**
     * True when the last submission was rejected by the AI misclassification check and the
     * user may submit again to continue at their own risk.
     */
    canSkipAiValidation:
      fieldValues.services_and_deliverables_error_skippable === true,
    /**
     * True until the contractor and the current step's form are known: `employmentId` is
     * empty, or the employment, its contract documents or the schema are still loading.
     */
    isLoading:
      !employmentId ||
      isLoadingEmployment ||
      isLoadingContractDocuments ||
      (isContractDetailsStep && isLoadingContractDetailsForm),
    /**
     * True while the contract document is being created.
     */
    isSubmitting: createContractDocumentMutation.isPending,
  };
};
