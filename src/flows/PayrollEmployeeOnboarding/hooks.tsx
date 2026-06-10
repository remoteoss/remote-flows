import { useMemo, useCallback, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { useGPOnboardingSteps } from '@/src/common/api/gpOnboarding';
import { useStepState } from '@/src/flows/useStepState';
import type { Step } from '@/src/flows/useStepState';
import type { PayrollEmployeeOnboardingFlowProps } from '@/src/flows/PayrollEmployeeOnboarding/types';
import { useErrorReporting } from '@/src/components/error-handling/useErrorReporting';
import { mutationToPromise } from '@/src/lib/mutations';
import { parseJSFToValidate } from '@/src/components/form/utils';
import {
  useGPEmployeeFormSchema,
  useGPUpdatePersonalDetails,
  useGPUpdateHomeAddress,
  useGPUpdateBankAccount,
} from '@/src/flows/PayrollEmployeeOnboarding/api';
import type {
  JSONSchemaFormResultWithFieldsets,
  JSFModify,
} from '@/src/flows/types';

export type EmployeeStepKey =
  | 'personal_details'
  | 'home_address'
  | 'bank_account';

// Stable module-level jsfModify for personal_details — avoids recreating createHeadlessForm
// on every render (select closure captures fieldValues from outer scope per render, so the
// schema data itself is always fresh; the jsfModify just needs to be reference-stable).
const PERSONAL_DETAILS_JSF_MODIFY: JSFModify = {
  fields: {
    // 'name' is a computed read-only display field; hide it so it is never submitted
    // (additionalProperties: false on the PUT endpoint rejects it).
    name: { 'x-jsf-presentation': { inputType: 'hidden' } },
    // Clarify that mobile_number expects digits only (no + or country code) for USA
    mobile_number: {
      description: 'Enter 10 digits, no country code (e.g. 5389274785)',
    },
  },
};

// Steps are stable — bank_account visibility is not derived from loaded API data.
// Consumers check selfOnboardingSubsteps to decide whether to render BankAccountStep.
const EMPLOYEE_STEPS: Record<EmployeeStepKey, Step<EmployeeStepKey>> = {
  personal_details: { index: 0, name: 'personal_details' },
  home_address: { index: 1, name: 'home_address' },
  bank_account: { index: 2, name: 'bank_account' },
};

export const usePayrollEmployeeOnboarding = ({
  employmentId,
  countryCode,
  initialValues,
  options,
}: Omit<PayrollEmployeeOnboardingFlowProps, 'render'>) => {
  const [fieldValues, setFieldValues] = useState<FieldValues>({});

  const { updateErrorContext } = useErrorReporting({
    flow: 'payroll_employee_onboarding',
  });

  const onStepChange = useCallback(
    (step: Step<EmployeeStepKey>) => {
      updateErrorContext({ step: step.name });
    },
    [updateErrorContext],
  );

  const { stepState, nextStep, previousStep, goToStep, setStepValues } =
    useStepState<EmployeeStepKey>(EMPLOYEE_STEPS, onStepChange);

  const currentStep = stepState.currentStep.name;

  // ── Schema queries ──────────────────────────────────────────────────────────

  const personalDetailsSchema = useGPEmployeeFormSchema(
    countryCode,
    'global_payroll_personal_details',
    fieldValues,
    { enabled: currentStep === 'personal_details' },
    PERSONAL_DETAILS_JSF_MODIFY,
  );

  const homeAddressSchema = useGPEmployeeFormSchema(
    countryCode,
    'address_details',
    fieldValues,
    { enabled: currentStep === 'home_address' },
  );

  const bankAccountSchema = useGPEmployeeFormSchema(
    countryCode,
    'global_payroll_bank_account_details',
    fieldValues,
    { enabled: currentStep === 'bank_account' },
  );

  const currentSchema = useMemo(() => {
    if (currentStep === 'personal_details') return personalDetailsSchema.data;
    if (currentStep === 'home_address') return homeAddressSchema.data;
    if (currentStep === 'bank_account') return bankAccountSchema.data;
    return undefined;
  }, [
    currentStep,
    personalDetailsSchema.data,
    homeAddressSchema.data,
    bankAccountSchema.data,
  ]);

  const isLoadingSchema =
    personalDetailsSchema.isLoading ||
    homeAddressSchema.isLoading ||
    bankAccountSchema.isLoading;

  // ── Mutations ───────────────────────────────────────────────────────────────

  const updatePersonalDetailsMutation = useGPUpdatePersonalDetails();
  const updateHomeAddressMutation = useGPUpdateHomeAddress();
  const updateBankAccountMutation = useGPUpdateBankAccount();

  const { mutateAsyncOrThrow: updatePersonalDetailsAsync } = mutationToPromise(
    updatePersonalDetailsMutation,
  );
  const { mutateAsyncOrThrow: updateHomeAddressAsync } = mutationToPromise(
    updateHomeAddressMutation,
  );
  const { mutateAsyncOrThrow: updateBankAccountAsync } = mutationToPromise(
    updateBankAccountMutation,
  );

  const isSubmitting =
    updatePersonalDetailsMutation.isPending ||
    updateHomeAddressMutation.isPending ||
    updateBankAccountMutation.isPending;

  // ── API steps ───────────────────────────────────────────────────────────────

  const {
    data: apiSteps,
    isLoading: isLoadingSteps,
    refetch: refetchSteps,
  } = useGPOnboardingSteps(employmentId);

  const selfOnboardingSubsteps = useMemo(() => {
    const selfOnboarding = apiSteps?.find((s) => s.type === 'self_onboarding');
    return selfOnboarding?.sub_steps ?? [];
  }, [apiSteps]);

  const isComplete =
    apiSteps?.find((s) => s.type === 'completion')?.sub_steps?.[0]?.status ===
    'completed';

  // ── Form helpers ────────────────────────────────────────────────────────────

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
        case 'personal_details': {
          const data = await updatePersonalDetailsAsync(parsedValues);
          await refetchSteps();
          return data;
        }
        case 'home_address': {
          const data = await updateHomeAddressAsync(parsedValues);
          await refetchSteps();
          return data;
        }
        case 'bank_account': {
          const data = await updateBankAccountAsync(parsedValues);
          await refetchSteps();
          return data;
        }
        default:
          return;
      }
    },
    [
      currentStep,
      parseFormValues,
      updatePersonalDetailsAsync,
      updateHomeAddressAsync,
      updateBankAccountAsync,
      refetchSteps,
    ],
  );

  return {
    stepState,
    isLoading: isLoadingSteps || isLoadingSchema,
    isSubmitting,
    isComplete: isComplete ?? false,
    employmentId,
    countryCode,
    initialValues,
    options,
    apiSteps,
    selfOnboardingSubsteps,
    refetchSteps,
    fields: currentSchema?.fields ?? [],
    meta: (currentSchema?.meta ??
      {}) as JSONSchemaFormResultWithFieldsets['meta'],
    fieldValues,
    setFieldValues,
    handleValidation,
    parseFormValues,
    onSubmit,
    goToNextStep: nextStep,
    goToPreviousStep: previousStep,
    goToStep,
    setStepValues,
  };
};
