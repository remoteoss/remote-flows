import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import equal from 'fast-deep-equal';
import { useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { CreateJobTitleEligibilityCheckParams } from '@/src/client';
import { Client } from '@/src/client/client';
import { useClient } from '@/src/context';
import { jobTitleEligibilityCheckOptions } from '@/src/flows/Onboarding/api';
import {
  getJobTitleEligibilityParams,
  StepKeys,
} from '@/src/flows/Onboarding/utils';
import { JSFFields } from '@/src/types/remoteFlows';

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
    const paramsChanged = !equal(paramsRef.current, nextParams);
    if (paramsChanged) {
      setParams(nextParams);
    }
    if (nextParams && paramsChanged) {
      await queryClient
        .query(getOptions(nextParams))
        .catch(() =>
          console.error('Failed to fetch job title eligibility check'),
        );
    }
  };

  return {
    isFetching: query.isFetching,
    check,
  };
};
