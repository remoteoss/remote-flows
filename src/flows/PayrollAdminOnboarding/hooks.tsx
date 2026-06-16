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
  useGPCreateEmployment,
  useGPUpdateContractDetails,
  useGPUpdateAdministrativeDetails,
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

  // Derive from state so setInternalCountryCode is reflected in step visibility
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

  const currentSchema = useMemo(() => {
    const schemaByStep: Partial<
      Record<AdminStepKey, typeof basicInfoSchema.data>
    > = {
      select_country: basicInfoSchema.data,
      contract_details: contractDetailsSchema.data,
      administrative_details: adminDetailsSchema.data,
    };
    return schemaByStep[currentStep];
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
    setFieldValues,
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
