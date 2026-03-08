import * as react_jsx_runtime from 'react/jsx-runtime';
import { B as BasicInformationFormPayload } from '../../../types-WZDLbTRZ.js';
import { q as EmploymentCreationResponse } from '../../../types.gen-CIMOKNAn.js';
import { N as NormalizedFieldError } from '../../../mutations-KX37KHHt.js';
import '../../Onboarding/components/OnboardingBack.js';
import 'react';
import '../../Onboarding/components/OnboardingInvite.js';
import '../../../remoteFlows-BlCKwGdn.js';
import 'yup';
import '../../../types-ZWIpiFgj.js';
import 'react-hook-form';
import '../../Onboarding/components/OnboardingSubmit.js';
import '@tanstack/query-core';
import '@remoteoss/remote-json-schema-form-kit';
import '../../useStepState.js';
import '../../types.js';
import '../../Onboarding/components/SaveDraftButton.js';

type BasicInformationStepProps = {
    onSubmit?: (payload: BasicInformationFormPayload) => void | Promise<void>;
    onSuccess?: (data: EmploymentCreationResponse) => void | Promise<void>;
    onError?: ({ error, rawError, fieldErrors, }: {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: NormalizedFieldError[];
    }) => void;
};
declare function BasicInformationStep({ onSubmit, onSuccess, onError, }: BasicInformationStepProps): react_jsx_runtime.JSX.Element;

export { BasicInformationStep };
