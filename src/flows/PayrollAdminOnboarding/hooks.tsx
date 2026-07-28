import { useState, useMemo, useCallback } from 'react';
import type { FieldValues } from 'react-hook-form';
import {
  useGPOnboardingSteps,
  useGPLegalEntities,
} from '@/src/common/api/gpOnboarding';
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
  useGPUpdateBasicInformation,
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
  legalEntityId: providedLegalEntityId,
  countryCode: initialCountryCode,
  employmentId: initialEmploymentId,
  initialValues,
  options,
}: Omit<PayrollAdminOnboardingFlowProps, 'render'>) => {
  // Always fetch, even when the caller already pinned a legal entity — so
  // `legalEntities` below stays accurate for callers that inspect it (e.g. to
  // render their own "no GP-enabled legal entity" state) instead of always
  // reporting empty just because the fetch was skipped.
  const { data: legalEntities, isLoading: isLoadingLegalEntities } =
    useGPLegalEntities(companyId);

  // If there are no GP-enabled legal entities, this stays undefined — the
  // consumer is expected to check `legalEntities` and not render the flow.
  const legalEntityId = providedLegalEntityId ?? legalEntities?.[0]?.id;

  const [internalEmploymentId, setInternalEmploymentId] = useState<
    string | undefined
  >(initialEmploymentId);

  const initialValuesCountryCode = (
    initialValues?.basic_information as { country_code?: string } | undefined
  )?.country_code;

  const [internalCountryCode, setInternalCountryCode] = useState<
    string | undefined
  >(initialCountryCode ?? initialValuesCountryCode);

  // Only skip country selection when resuming an existing employment — both
  // country and employmentId must be known upfront. Providing only countryCode
  // would bypass the select_country branch (the only place createEmployment
  // runs) and leave the flow with no employmentId for subsequent steps.
  // internalCountryCode also covers country inferred from initialValues, not
  // just the explicit countryCode prop.
  const skipCountry = !!internalCountryCode && !!initialEmploymentId;

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

  // Country-picker schema for the select_country step, before a country is chosen.
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
  const updateBasicInformationMutation = useGPUpdateBasicInformation();
  const updateContractDetailsMutation = useGPUpdateContractDetails();
  const updateAdminDetailsMutation = useGPUpdateAdministrativeDetails();

  const { mutateAsyncOrThrow: createEmploymentAsync } = mutationToPromise(
    createEmploymentMutation,
  );
  const { mutateAsyncOrThrow: updateBasicInformationAsync } = mutationToPromise(
    updateBasicInformationMutation,
  );
  const { mutateAsyncOrThrow: updateContractDetailsAsync } = mutationToPromise(
    updateContractDetailsMutation,
  );
  const { mutateAsyncOrThrow: updateAdminDetailsAsync } = mutationToPromise(
    updateAdminDetailsMutation,
  );

  const isSubmitting =
    createEmploymentMutation.isPending ||
    updateBasicInformationMutation.isPending ||
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

  // Keep internalCountryCode in sync with the country_code field whenever it
  // changes — both when it's first picked on the country-picker phase, and if
  // it's later edited from the basic-information form (which also exposes the
  // field), so submission never uses a stale country code.
  const handleFieldValues = useCallback(
    (values: FieldValues) => {
      setFieldValues(values);
      const countryCode = values.country_code as string | undefined;
      if (countryCode && countryCode !== internalCountryCode) {
        setInternalCountryCode(countryCode);
      }
    },
    [internalCountryCode, setFieldValues],
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
          // Prefer the just-submitted country_code so the employment is created
          // with the same country the basicInformation was validated against,
          // even if the internalCountryCode sync hasn't caught up yet.
          const countryCode =
            (parsedValues.country_code as string | undefined) ??
            internalCountryCode;
          if (!countryCode) {
            throw new Error(
              'Country code is required to create an employment.',
            );
          }
          // Keep internalCountryCode in sync with the country being submitted so
          // the contract/administrative schemas (keyed on it) load once we
          // advance.
          if (countryCode !== internalCountryCode) {
            setInternalCountryCode(countryCode);
          }

          // If the employment already exists (resume, or returning to this step
          // to edit basic information), update it instead of creating a second
          // one — this also persists edits made on a repeat submit.
          if (internalEmploymentId) {
            const data = await updateBasicInformationAsync({
              employmentId: internalEmploymentId,
              basicInformation: parsedValues,
            });
            await refetchSteps();
            return data;
          }

          if (!legalEntityId) {
            throw new Error(
              'No GP-enabled legal entity available. Cannot create an employment.',
            );
          }

          const data = await createEmploymentAsync({
            countryCode,
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
      updateBasicInformationAsync,
      updateContractDetailsAsync,
      updateAdminDetailsAsync,
      refetchSteps,
    ],
  );

  return {
    stepState,
    isLoading: isLoadingSteps || isLoadingSchema || isLoadingLegalEntities,
    isSubmitting,
    isComplete: isComplete ?? false,
    companyId,
    legalEntityId,
    legalEntities: legalEntities ?? [],
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
