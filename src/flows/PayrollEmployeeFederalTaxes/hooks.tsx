import { useCallback, useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { useGPOnboardingSteps } from '@/src/common/api/gpOnboarding';
import { useErrorReporting } from '@/src/components/error-handling/useErrorReporting';
import { mutationToPromise } from '@/src/lib/mutations';
import { parseJSFToValidate } from '@/src/components/form/utils';
import {
  useGPFederalTaxesSchema,
  useGPUpdateFederalTaxes,
} from '@/src/flows/PayrollEmployeeFederalTaxes/api';
import type {
  FederalTaxesUnavailableReason,
  PayrollEmployeeFederalTaxesFlowProps,
} from '@/src/flows/PayrollEmployeeFederalTaxes/types';
import type { JSONSchemaFormResultWithFieldsets } from '@/src/flows/types';

export const usePayrollEmployeeFederalTaxes = ({
  employmentId,
  countryCode,
  initialValues,
  options: _options,
}: Omit<PayrollEmployeeFederalTaxesFlowProps, 'render'>) => {
  const [fieldValues, setFieldValues] = useState<FieldValues>(
    (initialValues?.federal_taxes as FieldValues) ?? {},
  );

  useErrorReporting({
    flow: 'payroll_employee_federal_taxes',
  });

  const isSupportedCountry = countryCode === 'USA';

  // Probe employment status via onboarding-steps. The completion step is
  // marked completed once the employment becomes active, which is when Tiger
  // creates the federal_taxes tax_task. Calling PUT /v1/employee/federal-taxes
  // before this point returns 404.
  const {
    data: apiSteps,
    isLoading: isLoadingSteps,
    refetch: refetchSteps,
  } = useGPOnboardingSteps(employmentId);

  const isActive = useMemo(() => {
    const completionStep = apiSteps?.find((s) => s.type === 'completion');
    return completionStep?.sub_steps?.[0]?.status === 'completed';
  }, [apiSteps]);

  const isAvailable = isSupportedCountry && isActive;
  const unavailableReason: FederalTaxesUnavailableReason | null =
    !isSupportedCountry
      ? 'unsupported_country'
      : !isActive
        ? 'pending_enrollment'
        : null;

  const schema = useGPFederalTaxesSchema(countryCode, fieldValues, {
    enabled: isAvailable,
  });

  const updateFederalTaxesMutation = useGPUpdateFederalTaxes();
  const { mutateAsyncOrThrow: updateFederalTaxesAsync } = mutationToPromise(
    updateFederalTaxesMutation,
  );

  const handleValidation = useCallback(
    async (values: FieldValues) => {
      if (!schema.data) return null;
      const parsedValues = await parseJSFToValidate(
        values,
        schema.data.fields,
        { isPartialValidation: false },
      );
      return schema.data.handleValidation(parsedValues);
    },
    [schema.data],
  );

  const parseFormValues = useCallback(
    async (values: FieldValues): Promise<Record<string, unknown>> => {
      if (!schema.data) return values;
      return parseJSFToValidate(values, schema.data.fields, {
        isPartialValidation: false,
      });
    },
    [schema.data],
  );

  const onSubmit = useCallback(
    async (values: FieldValues) => {
      const parsedValues = await parseFormValues(values);
      const data = await updateFederalTaxesAsync(parsedValues);
      await refetchSteps();
      return data;
    },
    [parseFormValues, updateFederalTaxesAsync, refetchSteps],
  );

  return {
    employmentId,
    countryCode,
    initialValues,
    isAvailable,
    unavailableReason,
    isLoading: isLoadingSteps || schema.isLoading,
    isSubmitting: updateFederalTaxesMutation.isPending,
    fields: schema.data?.fields ?? [],
    meta: (schema.data?.meta ??
      {}) as JSONSchemaFormResultWithFieldsets['meta'],
    fieldValues,
    setFieldValues,
    handleValidation,
    parseFormValues,
    onSubmit,
    refetchSteps,
  };
};
