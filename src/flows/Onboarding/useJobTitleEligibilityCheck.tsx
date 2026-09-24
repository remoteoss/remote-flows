import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import {
  CreateJobTitleEligibilityCheckParams,
  JobTitleEligibilityCheck,
} from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
import { jobTitleEligibilityCheckOptions } from '@/src/flows/Onboarding/api';
import {
  getJobTitleEligibilityParams,
  getJobTitleEligibilityValues,
  StepKeys,
} from '@/src/flows/Onboarding/utils';
import { FieldError, isMutationError } from '@/src/lib/mutations';
import { JSFFields } from '@/src/types/remoteFlows';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import equal from 'fast-deep-equal';
import { useEffect, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';

export type JobTitleEligibilityValues = Record<string, string | null>;

/**
 * Owns the state and query for the job title eligibility check: the visit counter, the role
 * answers a check was last run for, the query itself, and the check's result (kept as both a
 * ref, for reads that must not go stale inside a memoized callback, and state, so consumers
 * that need to re-render when the result changes can do so).
 *
 * Called separately from, and before, `useJobTitleEligibilityCheck` because its `values` output
 * feeds the `contract_details` JSON schema form as `additionalValues` — which happens earlier in
 * the render than the schema's own fields (`stepFields.contract_details`) become available, and
 * those fields are what the check itself needs as an input.
 */
export const useJobTitleEligibilityState = ({
  employmentId,
  enabled,
  currentStepName,
}: {
  employmentId: string | undefined;
  enabled: boolean;
  currentStepName: StepKeys;
}) => {
  const { client } = useClient();
  const visitRef = useRef(0);
  const [params, setParams] =
    useState<CreateJobTitleEligibilityCheckParams | null>(null);

  const getOptions = (checkParams: CreateJobTitleEligibilityCheckParams) =>
    jobTitleEligibilityCheckOptions(
      client as Client,
      employmentId as string,
      visitRef.current,
      checkParams,
    );

  const query = useQuery({
    ...getOptions(params ?? {}),
    enabled: Boolean(
      enabled &&
      employmentId &&
      currentStepName === 'contract_details' &&
      params,
    ),
  });

  const valuesRef = useRef<JobTitleEligibilityValues | null>(null);
  const [values, setValues] = useState<JobTitleEligibilityValues | null>(null);

  const updateValues = (next: JobTitleEligibilityValues | null) => {
    valuesRef.current = next;
    setValues(next);
  };

  return {
    params,
    setParams,
    getOptions,
    query,
    values,
    valuesRef,
    updateValues,
    startNewVisit: () => {
      visitRef.current += 1;
    },
  };
};

type EligibilityForSubmitResult =
  | null
  | { ok: true; checkValues: JobTitleEligibilityValues }
  | {
      ok: false;
      error: Error;
      rawError: Record<string, unknown>;
      fieldErrors: FieldError[];
    };

/**
 * Runs the job title eligibility check: seeds it on entering `contract_details`, re-runs it
 * through `check` (wired to the prebuilt form's `onBlur`) and `checkForSubmit` (called at
 * submit time), and keeps the result in sync with the current role answers.
 *
 * Takes `state` from `useJobTitleEligibilityState`, called earlier in the render, plus
 * everything here that only exists once the contract details schema has loaded
 * (`contractDetailsFields`) and `handleValidation` has been defined.
 */
export const useJobTitleEligibilityCheck = ({
  state,
  enabled,
  employmentId,
  currentStepName,
  contractDetailsFields,
  stepValues,
  initialContractDetailsValues,
  fieldValues,
  jobTitle,
  parseFormValues,
  handleValidation,
}: {
  state: ReturnType<typeof useJobTitleEligibilityState>;
  enabled: boolean;
  employmentId: string | undefined;
  currentStepName: StepKeys;
  contractDetailsFields: JSFFields;
  stepValues: Record<string, unknown> | undefined;
  initialContractDetailsValues: Record<string, unknown>;
  fieldValues: FieldValues;
  jobTitle: string | undefined;
  parseFormValues: (values: FieldValues) => Promise<Record<string, unknown>>;
  handleValidation: (
    values: FieldValues,
  ) => Promise<ValidationResult | null | undefined>;
}) => {
  const queryClient = useQueryClient();
  const {
    params,
    setParams,
    getOptions,
    query,
    values,
    valuesRef,
    updateValues,
    startNewVisit,
  } = state;

  const check = async (values: FieldValues) => {
    if (!enabled || !employmentId || currentStepName !== 'contract_details') {
      return;
    }
    const validation = await handleValidation(values);
    const parsedValues = await parseFormValues(values);
    const nextParams = getJobTitleEligibilityParams(
      contractDetailsFields,
      parsedValues,
      validation?.formErrors,
      jobTitle,
    );
    setParams((current) => (equal(current, nextParams) ? current : nextParams));
    if (nextParams) {
      await queryClient.query(getOptions(nextParams)).catch(() => undefined);
    }
  };

  const hasContractDetailsFields = contractDetailsFields.length > 0;

  useEffect(() => {
    if (!enabled) {
      return;
    }
    setParams(null);
    updateValues(null);
    if (currentStepName === 'contract_details' && hasContractDetailsFields) {
      startNewVisit();
      check(stepValues || initialContractDetailsValues);
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, currentStepName, hasContractDetailsFields]);

  const settledCheck = params ? query.data : undefined;

  useEffect(() => {
    const checkValues = settledCheck
      ? getJobTitleEligibilityValues(contractDetailsFields, settledCheck)
      : null;
    if (!equal(checkValues, valuesRef.current)) {
      updateValues(checkValues);
      if (currentStepName === 'contract_details') {
        handleValidation(fieldValues);
      }
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [settledCheck]);

  const checkForSubmit = async (
    values: FieldValues,
    parsedValues: Record<string, unknown>,
  ): Promise<EligibilityForSubmitResult> => {
    if (!enabled) {
      return null;
    }
    const submittedParams = getJobTitleEligibilityParams(
      contractDetailsFields,
      parsedValues,
      undefined,
      jobTitle,
    );
    if (!submittedParams) {
      return null;
    }
    setParams(submittedParams);
    let check: JobTitleEligibilityCheck | undefined;
    try {
      check = await queryClient.query(getOptions(submittedParams));
    } catch (error) {
      if (isMutationError(error)) {
        updateValues(null);
        return {
          ok: false,
          error: error.error,
          rawError: error.rawError,
          fieldErrors: error.fieldErrors,
        };
      }
      throw error;
    }
    if (!check) {
      return null;
    }
    const checkValues = getJobTitleEligibilityValues(
      contractDetailsFields,
      check,
    );
    updateValues(checkValues);
    const validation = await handleValidation(values);
    const formErrors = validation?.formErrors ?? {};
    if (Object.keys(formErrors).length > 0) {
      return {
        ok: false,
        error: new Error(
          'The job title eligibility check requires changes to the contract details',
        ),
        rawError: formErrors,
        fieldErrors: Object.entries(formErrors).map(([field, message]) => ({
          field,
          messages: [
            typeof message === 'string' ? message : JSON.stringify(message),
          ],
        })),
      };
    }
    return { ok: true, checkValues };
  };

  return {
    values,
    valuesRef,
    isFetching: query.isFetching,
    check,
    checkForSubmit,
  };
};
