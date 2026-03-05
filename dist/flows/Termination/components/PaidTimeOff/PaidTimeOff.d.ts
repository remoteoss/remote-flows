import * as react_jsx_runtime from 'react/jsx-runtime';
import { P as PaidTimeOffRenderProps } from '../../../../types-CMxc3psz.js';
import '../../../../types.gen-BxpagbHP.js';
import '@tanstack/react-query';
import '@tanstack/query-core';
import '../../api.js';
import '../../../../remoteFlows-DI0ouAyb.js';
import 'react';
import 'yup';
import '../../../../types-ZWIpiFgj.js';
import 'react-hook-form';
import '@remoteoss/remote-json-schema-form-kit';
import '../../../../types-DdtBq-tA.js';
import '../../../Onboarding/components/OnboardingBack.js';
import '../../../Onboarding/components/OnboardingInvite.js';
import '../../../../mutations-BKtilfHK.js';
import '../../../Onboarding/components/OnboardingSubmit.js';
import '../../../useStepState.js';
import '../../../types.js';
import '../../../Onboarding/components/SaveDraftButton.js';
import '../../../../types-CtFp_3rd.js';
import '@remoteoss/json-schema-form';
import '@remoteoss/json-schema-form-v0-deprecated';
import '../../TerminationBack.js';
import '../../TerminationSubmit.js';

type PaidTimeOffProps = PaidTimeOffRenderProps;
/**
 * PaidTimeOff component
 *
 * This component is used to display the paid time off summary and details.
 * It displays the summary data and a button to open the details drawer.
 * When the details drawer is open, it displays the paid time off breakdown.
 */
declare const PaidTimeOff: ({ employeeName, proposedTerminationDate, summaryData, formattedProposedTerminationDate, timeoffQuery, employment, onOpenChange, open, }: PaidTimeOffProps) => react_jsx_runtime.JSX.Element;

export { PaidTimeOff, type PaidTimeOffProps };
