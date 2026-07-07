import { useState, useMemo, useCallback } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useGPOnboardingSteps } from '@/src/common/api/gpOnboarding';
import { useStepState } from '@/src/flows/useStepState';
import type { Step } from '@/src/flows/useStepState';
import type { PayrollAdminOnboardingFlowProps } from '@/src/flows/PayrollAdminOnboarding/types';
import { useErrorReporting } from '@/src/components/error-handling/useErrorReporting';
import { mutationToPromise } from '@/src/lib/mutations';
import { parseJSFToValidate } from '@/src/components/form/utils';
import {
  useGPFormSchema,
  useGPCountrySelectSchema,
  useGPCreateEmployment,
  useGPUpdateContractDetails,
  useGPUpdateAdministrativeDetails,
  type GPAdminSchemaType,
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
  >(
    initialCountryCode ??
      (initialValues?.basic_information as Record<string, unknown>)
        ?.country_code as string | undefined,
  );

  // Only skip country selection when resuming an existing employment — both
  // country and employmentId must be known upfront. Providing only countryCode
  // would bypass the select_country branch (the only place createEmployment
  // runs) and leave the flow with no employmentId for subsequent steps.
  const skipCountry = !!initialCountryCode && !!initialEmploymentId;

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

  const {
    stepState,
    nextStep,
    previousStep,
    goToStep,
    setStepValues,
    fieldValues,
    setFieldValues,
  } = useStepState<AdminStepKey>(steps, onStepChange);

  const currentStep = stepState.currentStep.name;

  const schemaTypeByStep: Partial<Record<AdminStepKey, GPAdminSchemaType>> = {
    select_country: 'global_payroll_basic_information',
    contract_details: 'global_payroll_contract_details',
    administrative_details: 'global_payroll_administrative_details',
  };

  // Always-on: provides the country picker schema for the select_country step
  // before a country has been chosen. Hooks must not be called conditionally.
  const countrySelectSchemaQuery = useGPCountrySelectSchema(fieldValues);

  const currentSchemaQuery = useGPFormSchema(
    internalCountryCode,
    schemaTypeByStep[currentStep],
    fieldValues,
    {
      employmentId:
        currentStep !== 'select_country' ? internalEmploymentId : undefined,
    },
  );

  // On the select_country step: show the country-picker schema until a country
  // is chosen, then switch to the basic-information schema.
  const isSelectCountryPhase =
    currentStep === 'select_country' && !internalCountryCode;
  const currentSchema = isSelectCountryPhase
    ? countrySelectSchemaQuery.data
    : currentSchemaQuery.data;
  const isLoadingSchema = isSelectCountryPhase
    ? countrySelectSchemaQuery.isLoading
    : currentSchemaQuery.isLoading;

  const createEmploymentMutation = useGPCreateEmployment();
  const updateContractDetailsMutation = useGPUpdateContractDetails();
  const updateAdminDetailsMutation = useGPUpdateAdministrativeDetails();

  const { mutateAsyncOrThrow: createEmploymentAsync } = mutationToPromise(
    createEmploymentMutation,
  );
  const { mutateAsyncOrThrow: updateContractDetailsAsync } = mutationToPromise(
    updateContractDetailsMutation,
  );
  const { mutateAsyncOrThrow: updateAdminDetailsAsync } = mutationToPromise(
    updateAdminDetailsMutation,
  );

  const isSubmitting =
    createEmploymentMutation.isPending ||
    updateContractDetailsMutation.isPending ||
    updateAdminDetailsMutation.isPending;

  const {
    data: apiSteps,
    isLoading: isLoadingSteps,
    refetch: refetchSteps,
  } = useGPOnboardingSteps(internalEmploymentId);

  const isComplete =
    apiSteps?.find((s) => s.type === 'completion')?.sub_steps?.[0]?.status ===
    'completed';

  // When the country picker is active, intercept field-change events so that
  // selecting a country immediately sets internalCountryCode, causing the
  // schema to switch from the country picker to the basic-information form.
  const handleFieldValues = useCallback(
    (values: FieldValues) => {
      setFieldValues(values);
      if (isSelectCountryPhase) {
        const countryCode = values.country_code as string | undefined;
        if (countryCode) {
          setInternalCountryCode(countryCode);
        }
      }
    },
    [isSelectCountryPhase, setFieldValues],
  );

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
          if (!internalCountryCode) {
            throw new Error(
              'Country code is required to create an employment.',
            );
          }
          const data = await createEmploymentAsync({
            countryCode: internalCountryCode,
            legalEntityId,
            basicInformation: parsedValues,
          });
          const empId = (data as { data?: { employment?: { id?: string } } })
            ?.data?.employment?.id;
          if (!empId) {
            throw new Error(
              'Employment was created but no ID was returned. Cannot proceed.',
            );
          }
          setInternalEmploymentId(empId);
          await refetchSteps();
          return data;
        }

        case 'contract_details': {
          if (!internalEmploymentId) {
            throw new Error(
              'Employment ID is missing. Complete the previous step first.',
            );
          }
          const data = await updateContractDetailsAsync({
            employmentId: internalEmploymentId,
            contractDetails: parsedValues,
          });
          await refetchSteps();
          return data;
        }

        case 'administrative_details': {
          if (!internalEmploymentId) {
            throw new Error(
              'Employment ID is missing. Complete the previous step first.',
            );
          }
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

  return {
    stepState,
    isLoading: isLoadingSteps || isLoadingSchema,
    isSubmitting,
    isComplete: isComplete ?? false,
    companyId,
    legalEntityId,
    countryCode: internalCountryCode,
    employmentId: internalEmploymentId,
    initialValues,
    options,
    apiSteps,
    refetchSteps,
    fields: currentSchema?.fields ?? [],
    meta: (currentSchema?.meta ??
      {}) as JSONSchemaFormResultWithFieldsets['meta'],
    fieldValues,
    setFieldValues: handleFieldValues,
    handleValidation,
    parseFormValues,
    onSubmit,
    setInternalCountryCode,
    setInternalEmploymentId,
    next: nextStep,
    back: previousStep,
    goToStep,
    setStepValues,
  };
};
