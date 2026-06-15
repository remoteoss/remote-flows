import { useMemo, useCallback, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { useGPOnboardingSteps } from '@/src/common/api/gpOnboarding';
import { useStepState } from '@/src/flows/useStepState';
import type { Step } from '@/src/flows/useStepState';
import type {
  PayrollEmployeeOnboardingFlowProps,
  TaxStepUnavailableReason,
} from '@/src/flows/PayrollEmployeeOnboarding/types';
import { useErrorReporting } from '@/src/components/error-handling/useErrorReporting';
import { isMutationError, mutationToPromise } from '@/src/lib/mutations';
import { parseJSFToValidate } from '@/src/components/form/utils';
import {
  useGPEmployeeFormSchema,
  useGPUpdateBankAccount,
  useGPUpdateFederalTaxes,
  useGPUpdateHomeAddress,
  useGPUpdatePersonalDetails,
  useGPUpdateStateTaxes,
} from '@/src/flows/PayrollEmployeeOnboarding/api';
import type {
  JSONSchemaFormResultWithFieldsets,
  JSFModify,
} from '@/src/flows/types';

export type EmployeeStepKey =
  | 'personal_details'
  | 'home_address'
  | 'bank_account'
  | 'federal_taxes'
  | 'state_taxes';

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

// Steps are stable. bank_account / federal_taxes / state_taxes are conditionally
// rendered by their components (BankAccountStep checks substeps; the tax steps check
// taxStepsAvailability) — consumers should decide which to render in their flow UI.
const EMPLOYEE_STEPS: Record<EmployeeStepKey, Step<EmployeeStepKey>> = {
  personal_details: { index: 0, name: 'personal_details' },
  home_address: { index: 1, name: 'home_address' },
  bank_account: { index: 2, name: 'bank_account' },
  federal_taxes: { index: 3, name: 'federal_taxes' },
  state_taxes: { index: 4, name: 'state_taxes' },
};

const TAX_STEPS = ['federal_taxes', 'state_taxes'] as const;
type TaxStepKey = (typeof TAX_STEPS)[number];

export const usePayrollEmployeeOnboarding = ({
  employmentId,
  countryCode,
  jurisdiction,
  initialValues,
  options,
}: Omit<PayrollEmployeeOnboardingFlowProps, 'render'>) => {
  const [fieldValues, setFieldValues] = useState<FieldValues>({});

  // Per-step failures detected at submit time. Used to retroactively flip a
  // tax step to `pending_enrollment` after the backend returns 404 with
  // `Tax task not found...`.
  const [taxSubmitFailures, setTaxSubmitFailures] = useState<
    Partial<Record<TaxStepKey, TaxStepUnavailableReason>>
  >({});

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

  // ── Tax-step availability ───────────────────────────────────────────────────
  //
  // The federal_taxes and state_taxes endpoints only respond once Tiger creates
  // the corresponding tax_task — which happens when the employment becomes
  // `active`. We don't have a clean signal callable with the employee token
  // (employments/:id returns 401, employee/current returns user+company only),
  // so we use the `completion` step as the best upfront probe and, when even
  // that is insufficient (e.g. step status is completed but employment lifecycle
  // is `onboarded`), we fall back to retroactively flipping the step to
  // `pending_enrollment` after the PUT returns 404. See `taxSubmitFailures`.
  const isUSA = countryCode === 'USA';
  const isPostEnrollment = isComplete ?? false;

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

  // The tax-step schema queries are gated only on country + active. We can't
  // gate on `taxStepsAvailability` here because availability itself depends on
  // the query outcome (schema_unavailable when 400/404), which would create a
  // dependency cycle. The query just won't surface in the UI when the step
  // isn't current — and a failed fetch flips availability to schema_unavailable
  // via the dedicated effect below.
  const federalTaxesSchema = useGPEmployeeFormSchema(
    countryCode,
    'global_payroll_federal_taxes',
    fieldValues,
    {
      enabled: isUSA && isPostEnrollment && currentStep === 'federal_taxes',
    },
  );

  const stateTaxesSchema = useGPEmployeeFormSchema(
    countryCode,
    'global_payroll_state_taxes',
    fieldValues,
    {
      enabled:
        isUSA &&
        !!jurisdiction &&
        isPostEnrollment &&
        currentStep === 'state_taxes',
    },
  );

  const currentSchema = useMemo(() => {
    if (currentStep === 'personal_details') return personalDetailsSchema.data;
    if (currentStep === 'home_address') return homeAddressSchema.data;
    if (currentStep === 'bank_account') return bankAccountSchema.data;
    if (currentStep === 'federal_taxes') return federalTaxesSchema.data;
    if (currentStep === 'state_taxes') return stateTaxesSchema.data;
    return undefined;
  }, [
    currentStep,
    personalDetailsSchema.data,
    homeAddressSchema.data,
    bankAccountSchema.data,
    federalTaxesSchema.data,
    stateTaxesSchema.data,
  ]);

  // Availability is computed AFTER schema queries so we can fold their error
  // state (e.g. backend returns 400 for an unseeded schema) into a friendly
  // `schema_unavailable` reason instead of letting the consumer render an
  // empty form.
  const taxStepsAvailability = useMemo(() => {
    const federalReason: TaxStepUnavailableReason | null = !isUSA
      ? 'unsupported_country'
      : taxSubmitFailures.federal_taxes
        ? taxSubmitFailures.federal_taxes
        : !isPostEnrollment
          ? 'pending_enrollment'
          : federalTaxesSchema.isError
            ? 'schema_unavailable'
            : null;

    const stateReason: TaxStepUnavailableReason | null = !isUSA
      ? 'unsupported_country'
      : !jurisdiction
        ? 'no_jurisdiction'
        : taxSubmitFailures.state_taxes
          ? taxSubmitFailures.state_taxes
          : !isPostEnrollment
            ? 'pending_enrollment'
            : stateTaxesSchema.isError
              ? 'schema_unavailable'
              : null;

    return {
      federal_taxes: {
        isAvailable: federalReason === null,
        unavailableReason: federalReason,
      },
      state_taxes: {
        isAvailable: stateReason === null,
        unavailableReason: stateReason,
      },
    };
  }, [
    isUSA,
    isPostEnrollment,
    jurisdiction,
    taxSubmitFailures,
    federalTaxesSchema.isError,
    stateTaxesSchema.isError,
  ]);

  const isLoadingSchema =
    personalDetailsSchema.isLoading ||
    homeAddressSchema.isLoading ||
    bankAccountSchema.isLoading ||
    federalTaxesSchema.isLoading ||
    stateTaxesSchema.isLoading;

  // ── Mutations ───────────────────────────────────────────────────────────────

  const updatePersonalDetailsMutation = useGPUpdatePersonalDetails();
  const updateHomeAddressMutation = useGPUpdateHomeAddress();
  const updateBankAccountMutation = useGPUpdateBankAccount();
  const updateFederalTaxesMutation = useGPUpdateFederalTaxes();
  const updateStateTaxesMutation = useGPUpdateStateTaxes(jurisdiction);

  const { mutateAsyncOrThrow: updatePersonalDetailsAsync } = mutationToPromise(
    updatePersonalDetailsMutation,
  );
  const { mutateAsyncOrThrow: updateHomeAddressAsync } = mutationToPromise(
    updateHomeAddressMutation,
  );
  const { mutateAsyncOrThrow: updateBankAccountAsync } = mutationToPromise(
    updateBankAccountMutation,
  );
  const { mutateAsyncOrThrow: updateFederalTaxesAsync } = mutationToPromise(
    updateFederalTaxesMutation,
  );
  const { mutateAsyncOrThrow: updateStateTaxesAsync } = mutationToPromise(
    updateStateTaxesMutation,
  );

  const isSubmitting =
    updatePersonalDetailsMutation.isPending ||
    updateHomeAddressMutation.isPending ||
    updateBankAccountMutation.isPending ||
    updateFederalTaxesMutation.isPending ||
    updateStateTaxesMutation.isPending;

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

  /**
   * Tiger's tax endpoints return 404 with `{message: "Tax task not found..."}`
   * when the employment hasn't reached post-enrollment. Convert that to a
   * `pending_enrollment` availability flip so the consumer can render the
   * not-available state instead of surfacing a raw error.
   */
  const handleTaxSubmitError = useCallback(
    (taxStep: TaxStepKey, error: unknown) => {
      if (!isMutationError(error)) return;
      const status = error.response?.status;
      const message =
        typeof error.rawError === 'object' &&
        error.rawError !== null &&
        'message' in error.rawError
          ? String((error.rawError as { message?: unknown }).message ?? '')
          : '';
      if (status === 404 || /tax task not found/i.test(message)) {
        setTaxSubmitFailures((prev) => ({
          ...prev,
          [taxStep]: 'pending_enrollment' as TaxStepUnavailableReason,
        }));
      }
    },
    [],
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
        case 'federal_taxes': {
          try {
            const data = await updateFederalTaxesAsync(parsedValues);
            await refetchSteps();
            return data;
          } catch (e) {
            handleTaxSubmitError('federal_taxes', e);
            throw e;
          }
        }
        case 'state_taxes': {
          try {
            const data = await updateStateTaxesAsync(parsedValues);
            await refetchSteps();
            return data;
          } catch (e) {
            handleTaxSubmitError('state_taxes', e);
            throw e;
          }
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
      updateFederalTaxesAsync,
      updateStateTaxesAsync,
      refetchSteps,
      handleTaxSubmitError,
    ],
  );

  return {
    stepState,
    isLoading: isLoadingSteps || isLoadingSchema,
    isSubmitting,
    isComplete: isComplete ?? false,
    employmentId,
    countryCode,
    jurisdiction,
    initialValues,
    options,
    apiSteps,
    selfOnboardingSubsteps,
    taxStepsAvailability,
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
