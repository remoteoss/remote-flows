import { useMemo, useCallback, useState, useEffect } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useGPOnboardingSteps } from '@/src/common/api/gpOnboarding';
import { useEmploymentQuery } from '@/src/common/api/employment';
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
import { TaxPendingEnrollmentError } from '@/src/flows/PayrollEmployeeOnboarding/taxErrors';

export type EmployeeStepKey =
  | 'personal_details'
  | 'home_address'
  | 'bank_account'
  | 'federal_taxes'
  | 'state_taxes';

// Stable module-level jsfModify configs for personal_details. Two variants:
// - USA: schema's mobile_number is a plain 10-digit string with `inputType: 'text'`.
//   Add a description so users know what's expected.
// - non-USA: schema's mobile_number is an `anyOf` of per-country dial-code
//   patterns. Force `inputType: 'tel'` so TelField renders a country picker +
//   national-number input. Without this it falls back to a plain text input
//   that silently fails the anyOf validation.
//
// Both variants hide `name` (a computed display-only field that the PUT
// endpoint rejects via `additionalProperties: false`).
const PERSONAL_DETAILS_HIDE_NAME = {
  name: { 'x-jsf-presentation': { inputType: 'hidden' } },
};

const PERSONAL_DETAILS_JSF_MODIFY_USA: JSFModify = {
  fields: {
    ...PERSONAL_DETAILS_HIDE_NAME,
    mobile_number: {
      description: 'Enter 10 digits, no country code (e.g. 5389274785)',
    },
  },
};

const PERSONAL_DETAILS_JSF_MODIFY_INTL: JSFModify = {
  fields: {
    ...PERSONAL_DETAILS_HIDE_NAME,
    mobile_number: { 'x-jsf-presentation': { inputType: 'tel' } },
  },
};

function getPersonalDetailsJsfModify(
  countryCode: string | undefined,
): JSFModify {
  return countryCode === 'USA'
    ? PERSONAL_DETAILS_JSF_MODIFY_USA
    : PERSONAL_DETAILS_JSF_MODIFY_INTL;
}

const buildEmployeeSteps = ({
  hasBankSubstep,
  federalTaxesVisible,
  stateTaxesVisible,
}: {
  hasBankSubstep: boolean;
  federalTaxesVisible: boolean;
  stateTaxesVisible: boolean;
}): Record<EmployeeStepKey, Step<EmployeeStepKey>> => ({
  personal_details: { index: 0, name: 'personal_details' },
  home_address: { index: 1, name: 'home_address' },
  bank_account: { index: 2, name: 'bank_account', visible: hasBankSubstep },
  federal_taxes: {
    index: 3,
    name: 'federal_taxes',
    visible: federalTaxesVisible,
  },
  state_taxes: { index: 4, name: 'state_taxes', visible: stateTaxesVisible },
});

const TAX_STEPS = ['federal_taxes', 'state_taxes'] as const;
type TaxStepKey = (typeof TAX_STEPS)[number];

export const usePayrollEmployeeOnboarding = ({
  employmentId,
  countryCode: countryCodeProp,
  jurisdiction: jurisdictionProp,
  initialValues,
  options,
}: Omit<PayrollEmployeeOnboardingFlowProps, 'render'>) => {
  // Per-step failures detected at submit time. Used to retroactively flip a
  // tax step to `pending_enrollment` after the backend returns 404 with
  // `Tax task not found...`.
  const [taxSubmitFailures, setTaxSubmitFailures] = useState<
    Partial<Record<TaxStepKey, TaxStepUnavailableReason>>
  >({});

  const { updateErrorContext } = useErrorReporting({
    flow: 'payroll_employee_onboarding',
  });

  // Only fetch the employment when the consumer hasn't supplied countryCode
  // themselves. This lookup requires a token that can reach
  // `/v1/employments/:id` — fine for a proxy that mints a different token per
  // path, but a plain employee-scoped assertion token gets a 401 here. So
  // consumers whose `auth` resolves to a single employee-scoped token for the
  // whole client must supply `countryCode` (and `jurisdiction`) explicitly.
  const { data: employment, isLoading: isLoadingEmployment } =
    useEmploymentQuery({ employmentId, enabled: !countryCodeProp });

  const countryCode = countryCodeProp ?? employment?.country?.code;
  // Prefer the work address state when present; fall back to the home
  // address state. State code is only meaningful for USA employments.
  const workState = (
    employment?.work_address_details as { state?: string } | undefined
  )?.state;
  const homeState = (
    employment?.address_details as { state?: string } | undefined
  )?.state;
  const jurisdiction = jurisdictionProp ?? (workState || homeState);

  const onStepChange = useCallback(
    (step: Step<EmployeeStepKey>) => {
      updateErrorContext({ step: step.name });
    },
    [updateErrorContext],
  );

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

  // ── Step visibility — drop steps the backend says are unneeded ──────────────
  const isUSA = countryCode === 'USA';
  const isPostEnrollment = isComplete ?? false;
  const hasBankSubstep = selfOnboardingSubsteps.some(
    (s) => s.type === 'employee_provides_bank_details',
  );

  const steps = useMemo(
    () =>
      buildEmployeeSteps({
        hasBankSubstep,
        federalTaxesVisible: isUSA && isPostEnrollment,
        stateTaxesVisible: isUSA && !!jurisdiction && isPostEnrollment,
      }),
    [hasBankSubstep, isUSA, isPostEnrollment, jurisdiction],
  );

  const {
    stepState,
    nextStep,
    previousStep,
    goToStep,
    setStepValues,
    fieldValues,
    setFieldValues,
  } = useStepState<EmployeeStepKey>(steps, onStepChange);

  const currentStep = stepState.currentStep.name;

  // A tax step flagged `pending_enrollment` after a 404 would otherwise stay
  // flagged for the whole session, trapping the user even once the backend tax
  // task appears. Clear the flag when the user (re)enters the step so revisiting
  // it re-attempts the submit instead of showing not-available forever.
  useEffect(() => {
    if (currentStep !== 'federal_taxes' && currentStep !== 'state_taxes')
      return;
    setTaxSubmitFailures((prev) => {
      if (!prev[currentStep]) return prev;
      const next = { ...prev };
      delete next[currentStep];
      return next;
    });
  }, [currentStep]);

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

  // ── Schema queries ──────────────────────────────────────────────────────────

  const personalDetailsSchema = useGPEmployeeFormSchema(
    countryCode,
    'global_payroll_personal_details',
    fieldValues,
    { enabled: currentStep === 'personal_details', employmentId },
    getPersonalDetailsJsfModify(countryCode),
  );

  const homeAddressSchema = useGPEmployeeFormSchema(
    countryCode,
    'address_details',
    fieldValues,
    { enabled: currentStep === 'home_address', employmentId },
  );

  const bankAccountSchema = useGPEmployeeFormSchema(
    countryCode,
    'global_payroll_bank_account_details',
    fieldValues,
    { enabled: currentStep === 'bank_account', employmentId },
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
      employmentId,
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
      employmentId,
      jurisdiction,
    },
  );

  const currentSchema = useMemo(() => {
    const schemaByStep: Partial<
      Record<EmployeeStepKey, typeof personalDetailsSchema.data>
    > = {
      personal_details: personalDetailsSchema.data,
      home_address: homeAddressSchema.data,
      bank_account: bankAccountSchema.data,
      federal_taxes: federalTaxesSchema.data,
      state_taxes: stateTaxesSchema.data,
    };
    return schemaByStep[currentStep];
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
    const federalReason = ((): TaxStepUnavailableReason | null => {
      if (!isUSA) return 'unsupported_country';
      if (taxSubmitFailures.federal_taxes)
        return taxSubmitFailures.federal_taxes;
      if (!isPostEnrollment) return 'pending_enrollment';
      if (federalTaxesSchema.isError) return 'schema_unavailable';
      return null;
    })();

    const stateReason = ((): TaxStepUnavailableReason | null => {
      if (!isUSA) return 'unsupported_country';
      if (!jurisdiction) return 'no_jurisdiction';
      if (taxSubmitFailures.state_taxes) return taxSubmitFailures.state_taxes;
      if (!isPostEnrollment) return 'pending_enrollment';
      if (stateTaxesSchema.isError) return 'schema_unavailable';
      return null;
    })();

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

  const updatePersonalDetailsMutation =
    useGPUpdatePersonalDetails(employmentId);
  const updateHomeAddressMutation = useGPUpdateHomeAddress(employmentId);
  const updateBankAccountMutation = useGPUpdateBankAccount(employmentId);
  const updateFederalTaxesMutation = useGPUpdateFederalTaxes(employmentId);
  const updateStateTaxesMutation = useGPUpdateStateTaxes(
    jurisdiction,
    employmentId,
  );

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
    (taxStep: TaxStepKey, error: unknown): boolean => {
      if (!isMutationError(error)) return false;
      const message =
        typeof error.rawError === 'object' &&
        error.rawError !== null &&
        'message' in error.rawError
          ? String((error.rawError as { message?: unknown }).message ?? '')
          : '';
      // Only a "tax task not found" response means the task isn't provisioned
      // yet (pending enrollment). Other 404s are genuine errors and must
      // surface rather than being hidden behind the pending-enrollment state.
      if (/tax task not found/i.test(message)) {
        setTaxSubmitFailures((prev) => ({
          ...prev,
          [taxStep]: 'pending_enrollment' as TaxStepUnavailableReason,
        }));
        return true;
      }
      return false;
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
            if (handleTaxSubmitError('federal_taxes', e)) {
              throw new TaxPendingEnrollmentError();
            }
            throw e;
          }
        }
        case 'state_taxes': {
          try {
            const data = await updateStateTaxesAsync(parsedValues);
            await refetchSteps();
            return data;
          } catch (e) {
            if (handleTaxSubmitError('state_taxes', e)) {
              throw new TaxPendingEnrollmentError();
            }
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
    isLoading: isLoadingEmployment || isLoadingSteps || isLoadingSchema,
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
    next: nextStep,
    back: previousStep,
    goToStep,
    setStepValues,
  };
};
