import { useState, useMemo, useCallback } from 'react';
import { FieldValues } from 'react-hook-form';
import { useGPOnboardingSteps } from '@/src/common/api/gpOnboarding';
import { useStepState } from '@/src/flows/useStepState';
import type { Step } from '@/src/flows/useStepState';
import type { PayrollAdminOnboardingFlowProps } from '@/src/flows/PayrollAdminOnboarding/types';
import { useErrorReporting } from '@/src/components/error-handling/useErrorReporting';
import { mutationToPromise } from '@/src/lib/mutations';
import { parseJSFToValidate } from '@/src/components/form/utils';
import {
  useGPFormSchema,
  useGPCreateEmployment,
  useGPUpdateContractDetails,
  useGPUpdateAdministrativeDetails,
  useGPInviteEmployee,
} from '@/src/flows/PayrollAdminOnboarding/api';
import type { JSONSchemaFormResultWithFieldsets } from '@/src/flows/types';

export type AdminStepKey =
  | 'select_country'
  | 'contract_details'
  | 'administrative_details'
  | 'invite';

const buildAdminSteps = (
  skipCountry: boolean,
): Record<AdminStepKey, Step<AdminStepKey>> => {
  let index = 0;
  return {
    select_country: {
      index: index++,
      name: 'select_country',
      visible: !skipCountry,
    },
    contract_details: { index: index++, name: 'contract_details' },
    administrative_details: {
      index: index++,
      name: 'administrative_details',
    },
    invite: { index: index++, name: 'invite' },
  };
};

export const usePayrollAdminOnboarding = ({
  companyId,
  legalEntityId,
  countryCode: initialCountryCode,
  employmentId: initialEmploymentId,
  initialValues,
  options,
}: Omit<PayrollAdminOnboardingFlowProps, 'render'>) => {
  const [internalEmploymentId, setInternalEmploymentId] = useState<
    string | undefined
  >(initialEmploymentId);

  const [internalCountryCode, setInternalCountryCode] = useState<
    string | undefined
  >(initialCountryCode);

  const [fieldValues, setFieldValues] = useState<FieldValues>({});

  // Fix: derive from state so setInternalCountryCode is reflected in step visibility
  const skipCountry = !!internalCountryCode && !!initialCountryCode;

  const steps = useMemo(() => buildAdminSteps(skipCountry), [skipCountry]);

  const { updateErrorContext } = useErrorReporting({
    flow: 'payroll_admin_onboarding',
  });

  const onStepChange = useCallback(
    (step: Step<AdminStepKey>) => {
      updateErrorContext({ step: step.name });
    },
    [updateErrorContext],
  );

  const { stepState, nextStep, previousStep, goToStep, setStepValues } =
    useStepState<AdminStepKey>(steps, onStepChange);

  const currentStep = stepState.currentStep.name;

  // Schema queries — each enabled only on its own step (or when employment exists for resume)
  const basicInfoSchema = useGPFormSchema(
    internalCountryCode,
    'global_payroll_basic_information',
    fieldValues,
    { enabled: currentStep === 'select_country' && !!internalCountryCode },
  );

  const contractDetailsSchema = useGPFormSchema(
    internalCountryCode,
    'global_payroll_contract_details',
    fieldValues,
    { enabled: currentStep === 'contract_details' && !!internalCountryCode },
  );

  const adminDetailsSchema = useGPFormSchema(
    internalCountryCode,
    'global_payroll_administrative_details',
    fieldValues,
    {
      enabled:
        currentStep === 'administrative_details' && !!internalCountryCode,
    },
  );

  // Current step's schema form
  const currentSchema = useMemo(() => {
    if (currentStep === 'select_country') return basicInfoSchema.data;
    if (currentStep === 'contract_details') return contractDetailsSchema.data;
    if (currentStep === 'administrative_details')
      return adminDetailsSchema.data;
    return undefined;
  }, [
    currentStep,
    basicInfoSchema.data,
    contractDetailsSchema.data,
    adminDetailsSchema.data,
  ]);

  const isLoadingSchema =
    basicInfoSchema.isLoading ||
    contractDetailsSchema.isLoading ||
    adminDetailsSchema.isLoading;

  // Mutations
  const createEmploymentMutation = useGPCreateEmployment();
  const updateContractDetailsMutation = useGPUpdateContractDetails();
  const updateAdminDetailsMutation = useGPUpdateAdministrativeDetails();
  const inviteEmployeeMutation = useGPInviteEmployee();

  const { mutateAsyncOrThrow: createEmploymentAsync } = mutationToPromise(
    createEmploymentMutation,
  );
  const { mutateAsyncOrThrow: updateContractDetailsAsync } = mutationToPromise(
    updateContractDetailsMutation,
  );
  const { mutateAsyncOrThrow: updateAdminDetailsAsync } = mutationToPromise(
    updateAdminDetailsMutation,
  );
  const { mutateAsyncOrThrow: inviteEmployeeAsync } = mutationToPromise(
    inviteEmployeeMutation,
  );

  const isSubmitting =
    createEmploymentMutation.isPending ||
    updateContractDetailsMutation.isPending ||
    updateAdminDetailsMutation.isPending ||
    inviteEmployeeMutation.isPending;

  const {
    data: apiSteps,
    isLoading: isLoadingSteps,
    refetch: refetchSteps,
  } = useGPOnboardingSteps(internalEmploymentId);

  const isComplete =
    apiSteps?.find((s) => s.type === 'completion')?.sub_steps?.[0]?.status ===
    'completed';

  const handleValidation = useCallback(
    async (values: FieldValues) => {
      if (!currentSchema) return null;
      const parsedValues = await parseJSFToValidate(
        values,
        currentSchema.fields,
        { isPartialValidation: false },
      );
      return currentSchema.handleValidation(parsedValues);
    },
    [currentSchema],
  );

  const parseFormValues = useCallback(
    async (values: FieldValues): Promise<Record<string, unknown>> => {
      if (!currentSchema) return values;
      return parseJSFToValidate(values, currentSchema.fields, {
        isPartialValidation: false,
      });
    },
    [currentSchema],
  );

  const onSubmit = useCallback(
    async (values: FieldValues) => {
      const parsedValues = await parseFormValues(values);

      switch (currentStep) {
        case 'select_country': {
          if (!internalCountryCode) return;
          const data = await createEmploymentAsync({
            countryCode: internalCountryCode,
            legalEntityId,
            basicInformation: parsedValues,
          });
          const empId = (data as { data?: { employment?: { id?: string } } })
            ?.data?.employment?.id;
          if (empId) {
            setInternalEmploymentId(empId);
            await refetchSteps();
          }
          return data;
        }

        case 'contract_details': {
          if (!internalEmploymentId) return;
          const data = await updateContractDetailsAsync({
            employmentId: internalEmploymentId,
            contractDetails: parsedValues,
          });
          await refetchSteps();
          return data;
        }

        case 'administrative_details': {
          if (!internalEmploymentId) return;
          const data = await updateAdminDetailsAsync({
            employmentId: internalEmploymentId,
            administrativeDetails: parsedValues,
          });
          await refetchSteps();
          return data;
        }

        default:
          return;
      }
    },
    [
      currentStep,
      internalCountryCode,
      internalEmploymentId,
      legalEntityId,
      parseFormValues,
      createEmploymentAsync,
      updateContractDetailsAsync,
      updateAdminDetailsAsync,
      refetchSteps,
    ],
  );

  // sendInvite does NOT call nextStep() — navigation is the caller's responsibility,
  // consistent with onSubmit. InvitationStep calls goToNextStep() after onSuccess.
  const sendInvite = useCallback(async () => {
    if (!internalEmploymentId) return;
    const data = await inviteEmployeeAsync({
      employmentId: internalEmploymentId,
    });
    await refetchSteps();
    return data;
  }, [internalEmploymentId, inviteEmployeeAsync, refetchSteps]);

  return {
    // Step state
    stepState,
    isLoading: isLoadingSteps || isLoadingSchema,
    isSubmitting,
    isComplete: isComplete ?? false,
    // Identity
    companyId,
    legalEntityId,
    countryCode: internalCountryCode,
    employmentId: internalEmploymentId,
    initialValues,
    options,
    // API steps
    apiSteps,
    refetchSteps,
    // Current step schema
    fields: currentSchema?.fields ?? [],
    meta: (currentSchema?.meta ??
      {}) as JSONSchemaFormResultWithFieldsets['meta'],
    fieldValues,
    setFieldValues,
    // Form helpers
    handleValidation,
    parseFormValues,
    onSubmit,
    sendInvite,
    // Navigation
    setInternalCountryCode,
    setInternalEmploymentId,
    goToNextStep: nextStep,
    goToPreviousStep: previousStep,
    goToStep,
    setStepValues,
  };
};
