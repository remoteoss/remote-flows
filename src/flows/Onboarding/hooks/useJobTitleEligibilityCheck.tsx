import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import {
  CancelledError,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import equal from 'fast-deep-equal';
import { useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { CreateJobTitleEligibilityCheckParams } from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
import { jobTitleEligibilityCheckOptions } from '@/src/flows/Onboarding/api';
import {
  getJobTitleEligibilityParams,
  getJobTitleEligibilityValues,
  JOB_TITLE_ELIGIBILITY_SLUG_FIELD,
  StepKeys,
} from '@/src/flows/Onboarding/utils';
import { JSFField, JSFFields } from '@/src/types/remoteFlows';

const CLEARED_JOB_TITLE_ELIGIBILITY_VALUES = getJobTitleEligibilityValues({
  check_id: null,
  verdict: 'not_assessed',
});

/**
 * Owns the state and query for the job title eligibility check.
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
  const [params, setParamsState] =
    useState<CreateJobTitleEligibilityCheckParams | null>(null);
  const paramsRef = useRef(params);

  const setParams = (next: CreateJobTitleEligibilityCheckParams | null) => {
    paramsRef.current = next;
    setParamsState(next);
  };

  const getOptions = (checkParams: CreateJobTitleEligibilityCheckParams) =>
    jobTitleEligibilityCheckOptions(
      client as Client,
      employmentId as string,
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

  return {
    paramsRef,
    setParams,
    getOptions,
    query,
  };
};

export const useJobTitleEligibilityCheck = ({
  enabled,
  employmentId,
  currentStepName,
  contractDetailsFields,
  fallbackJobTitle,
  submittedJobTitle,
  parseFormValues,
  handleValidation,
}: {
  enabled: boolean;
  employmentId: string | undefined;
  currentStepName: StepKeys;
  contractDetailsFields: JSFFields;
  fallbackJobTitle: string | undefined;
  parseFormValues: (values: FieldValues) => Promise<Record<string, unknown>>;
  handleValidation: (
    values: FieldValues,
  ) => Promise<ValidationResult | null | undefined>;
  submittedJobTitle: string | undefined;
}) => {
  const queryClient = useQueryClient();
  const { paramsRef, setParams, getOptions, query } =
    useJobTitleEligibilityState({
      employmentId,
      enabled,
      currentStepName,
    });

  const jobTitle = submittedJobTitle ?? fallbackJobTitle;

  const check = async (values: FieldValues) => {
    const hasSlugField = (contractDetailsFields as JSFField[]).some(
      (field) => field.name === JOB_TITLE_ELIGIBILITY_SLUG_FIELD,
    );
    if (
      !enabled ||
      !employmentId ||
      currentStepName !== 'contract_details' ||
      !hasSlugField
    ) {
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
    if (!equal(paramsRef.current, nextParams)) {
      setParams(nextParams);
    }
    if (!nextParams) {
      return CLEARED_JOB_TITLE_ELIGIBILITY_VALUES;
    }
    // Another check can start while this request is in flight. If it has changed
    // the params by the time this one settles, this result is out of date, so
    // return nothing and let the newer check's values stand.
    const isSuperseded = () => !equal(paramsRef.current, nextParams);

    try {
      const result = await queryClient.query(getOptions(nextParams));
      if (isSuperseded()) {
        return;
      }
      return getJobTitleEligibilityValues(result);
    } catch (error) {
      if (error instanceof CancelledError || isSuperseded()) {
        return;
      }
      console.error('Failed to fetch job title eligibility check');
      return CLEARED_JOB_TITLE_ELIGIBILITY_VALUES;
    }
  };

  return {
    isFetching: query.isFetching,
    check,
  };
};
