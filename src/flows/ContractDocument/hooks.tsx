import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
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
  useGetContractDocumentSignatureSchema,
  useGetShowContractDocument,
} from '@/src/common/contract-documents/api';
import { corProductIdentifier } from '@/src/common/contract-documents/constants';
import {
  buildContractDetailsJsfModify,
  buildContractPreviewJsfModify,
} from '@/src/common/contract-documents/jsfModify';
import {
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
  const [createdContractDocumentId, setCreatedContractDocumentId] = useState<
    string | undefined
  >(undefined);
  const [
    hasOpenedExistingContractDocument,
    setHasOpenedExistingContractDocument,
  ] = useState(false);
  const fieldsMetaRef = useRef<{ contract_details: NestedMeta }>({
    contract_details: {},
  });
  const isContractDetailsStep =
    stepState.currentStep.name === 'contract_details';
  const isContractPreviewStep =
    stepState.currentStep.name === 'contract_preview';

  const {
    data: employment,
    isLoading: isLoadingEmployment,
    isSuccess: hasEmploymentResponse,
    error: employmentQueryError,
  } = useEmploymentQuery({
    employmentId,
    queryParams: { exclude_files: true },
    enabled: Boolean(employmentId),
  });
  const employmentError =
    employmentQueryError ??
    (hasEmploymentResponse && !employment
      ? new Error('Failed to fetch employment')
      : null);

  const { data: contractDocuments, isLoading: isLoadingContractDocuments } =
    useQuery({
      ...contractDocumentsOptions(client as Client, employmentId),
      enabled: Boolean(employmentId),
      select: ({ data }) => data.data.contract_documents,
    });

  const existingContractDocumentId = contractDocuments?.[0]?.id;
  const contractDocumentId =
    createdContractDocumentId ?? existingContractDocumentId;

  const isOpeningExistingContractDocument =
    Boolean(existingContractDocumentId) && !hasOpenedExistingContractDocument;

  useEffect(() => {
    if (isOpeningExistingContractDocument) {
      setHasOpenedExistingContractDocument(true);
      goToStep('contract_preview');
    }
  }, [isOpeningExistingContractDocument, goToStep]);

  const {
    data: documentPreviewPdf,
    isLoading: isLoadingDocumentPreviewPdf,
    error: documentPreviewPdfError,
  } = useGetShowContractDocument({
    employmentId,
    contractDocumentId: contractDocumentId as string,
    options: { queryOptions: { enabled: Boolean(contractDocumentId) } },
  });

  const countryCode = employment?.country?.code;
  const productIdentifier = getProductIdentifier(employment?.contractor_type);
  const isContractorOfRecord = productIdentifier === corProductIdentifier;

  const {
    data: contractDetailsForm,
    isLoading: isLoadingContractDetailsForm,
    error: contractDetailsFormError,
  } = useContractorContractDetailsSchema({
    countryCode: countryCode as string,
    employmentId,
    fieldValues,
    options: {
      queryOptions: { enabled: Boolean(countryCode) },
      jsfModify: buildContractDetailsJsfModify(
        options?.jsfModify?.contract_details,
        undefined,
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

  const { data: signatureForm } = useGetContractDocumentSignatureSchema({
    fieldValues,
    options: {
      queryOptions: { enabled: isContractPreviewStep },
      jsfModify: buildContractPreviewJsfModify(
        options?.jsfModify?.contract_preview,
        fieldValues,
      ),
    },
  });

  const signatureFields = useMemo(
    () => (signatureForm?.fields ?? []) as Fields,
    [signatureForm?.fields],
  );

  const currentForm = isContractDetailsStep
    ? contractDetailsForm
    : signatureForm;

  const contractDetailsInitialValues = useMemo(
    () =>
      getInitialValues(contractDetailsFields, {
        ...employment?.contract_details,
        service_duration: {
          ...(employment?.contract_details?.service_duration as object),
          provisional_start_date: format(new Date(), 'yyyy-MM-dd'),
        },
      }),
    [contractDetailsFields, employment?.contract_details],
  );

  const contractPreviewInitialValues = useMemo(() => {
    const companySignatory =
      documentPreviewPdf?.contract_document?.signatories?.find(
        (signatory) => signatory.type === 'company',
      );
    return getInitialValues(signatureFields, {
      signature: companySignatory?.signature,
    });
  }, [signatureFields, documentPreviewPdf]);

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

  const markContractAsReviewed = useCallback(() => {
    setFieldValues((values) => ({ ...values, review_completed: true }));
  }, [setFieldValues]);

  const handleValidation = useCallback(
    async (values: FieldValues): Promise<ValidationResult | null> => {
      if (!currentForm) return null;

      const parsed = await parseJSFToValidate(values, currentForm.fields, {
        isPartialValidation: false,
      });

      return currentForm.handleValidation(parsed) ?? null;
    },
    [currentForm],
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
      fieldsMetaRef.current.contract_details = prettifyFormValues(
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
        setCreatedContractDocumentId(createdId);

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
    fields: isContractDetailsStep ? contractDetailsFields : signatureFields,
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
      contract_preview: contractPreviewInitialValues,
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
     * The contract document being previewed: the one created in this flow, or the
     * contractor's existing one.
     */
    contractDocumentId,
    /**
     * Document preview PDF data
     */
    documentPreviewPdf,
    /**
     * Function to mark the contract as reviewed
     */
    markContractAsReviewed,
    /**
     * True when the last submission was rejected by the AI misclassification check and the
     * user may submit again to continue at their own risk.
     */
    canSkipAiValidation:
      fieldValues.services_and_deliverables_error_skippable === true,
    /**
     * True until the contractor and the current step are known: `employmentId` is empty, or
     * the employment, its contract documents, the schema or the previewed document are still
     * loading.
     */
    isLoading:
      !employmentId ||
      isLoadingEmployment ||
      isLoadingContractDocuments ||
      isOpeningExistingContractDocument ||
      (isContractDetailsStep && isLoadingContractDetailsForm) ||
      (isContractPreviewStep && isLoadingDocumentPreviewPdf),
    /**
     * True while the contract document is being created.
     */
    isSubmitting: createContractDocumentMutation.isPending,
    /**
     * The error that stopped the flow from loading, if any: the employment, the contract
     * details schema or the previewed contract document could not be fetched.
     */
    error:
      employmentError ??
      contractDetailsFormError ??
      documentPreviewPdfError ??
      null,
  };
};
