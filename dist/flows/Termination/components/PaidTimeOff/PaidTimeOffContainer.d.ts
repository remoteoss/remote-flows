import * as React from 'react';
import { a as PaidTimeOffContainerProps } from '../../../../types-BQ5bWLh9.js';
import '../../../../types.gen-C6jD_TP6.js';
import '@tanstack/react-query';
import '@tanstack/query-core';
import '../../api.js';
import '../../../../remoteFlows-DL-yjkRb.js';
import 'yup';
import '../../../../types-ZWIpiFgj.js';
import 'react-hook-form';
import '@remoteoss/remote-json-schema-form-kit';
import '../../../../types-CTCype4R.js';
import 'react/jsx-runtime';
import '../../../Onboarding/components/OnboardingBack.js';
import '../../../Onboarding/components/OnboardingInvite.js';
import '../../../../mutations-qZ0G6FAl.js';
import '../../../Onboarding/components/OnboardingSubmit.js';
import '../../../useStepState.js';
import '../../../types.js';
import '../../../Onboarding/components/SaveDraftButton.js';
import '../../../../types-B6gTjRpk.js';
import '@remoteoss/json-schema-form';
import '@remoteoss/json-schema-form-v0-deprecated';
import '../../TerminationBack.js';
import '../../TerminationSubmit.js';

/**
 * PaidTimeOffContainer component
 *
 * This is a container component that manages paid time off (PTO) data retrieval and state
 * for the termination flow. It aggregates multiple time off-related queries and formats
 * the termination date for display.
 *
 */
declare const PaidTimeOffContainer: ({ proposedTerminationDate, employeeName, employmentId, employment, render, }: PaidTimeOffContainerProps) => React.ReactNode;

export { PaidTimeOffContainer };
