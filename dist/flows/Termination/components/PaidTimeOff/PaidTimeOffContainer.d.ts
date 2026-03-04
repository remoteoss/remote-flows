import * as React from 'react';
import { a as PaidTimeOffContainerProps } from '../../../../types-C5iJtmq7.js';
import '../../../../types.gen-CtACO7H3.js';
import '@tanstack/react-query';
import '@tanstack/query-core';
import '../../api.js';
import '../../../../remoteFlows-D7HHZxko.js';
import 'yup';
import '../../../../types-ZWIpiFgj.js';
import 'react-hook-form';
import '@remoteoss/remote-json-schema-form-kit';
import '../../../../types-3vEhRA0P.js';
import 'react/jsx-runtime';
import '../../../Onboarding/components/OnboardingBack.js';
import '../../../Onboarding/components/OnboardingInvite.js';
import '../../../../mutations-B5hd-NxF.js';
import '../../../Onboarding/components/OnboardingSubmit.js';
import '../../../useStepState.js';
import '../../../types.js';
import '../../../Onboarding/components/SaveDraftButton.js';
import '../../../../types-DqarOO0N.js';
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
