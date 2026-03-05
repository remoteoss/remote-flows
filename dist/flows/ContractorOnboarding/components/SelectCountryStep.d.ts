import * as react_jsx_runtime from 'react/jsx-runtime';
import { a as SelectCountryFormPayload, b as SelectCountrySuccess } from '../../../types-Dz9jtnMs.js';
import { N as NormalizedFieldError } from '../../../mutations-Bz0Iad09.js';
import '../../../types.gen-DZuOPZbG.js';
import '../../Onboarding/components/OnboardingBack.js';
import 'react';
import '../../Onboarding/components/OnboardingInvite.js';
import '../../../remoteFlows-DagBfxnm.js';
import 'yup';
import '../../../types-ZWIpiFgj.js';
import 'react-hook-form';
import '../../Onboarding/components/OnboardingSubmit.js';
import '@tanstack/query-core';
import '@remoteoss/remote-json-schema-form-kit';
import '../../useStepState.js';
import '../../types.js';
import '../../Onboarding/components/SaveDraftButton.js';

type SelectCountryStepProps = {
    onSubmit?: (payload: SelectCountryFormPayload) => void | Promise<void>;
    onSuccess?: (data: SelectCountrySuccess) => void | Promise<void>;
    onError?: ({ error, rawError, fieldErrors, }: {
        error: Error;
        rawError: Record<string, unknown>;
        fieldErrors: NormalizedFieldError[];
    }) => void;
};
declare function SelectCountryStep({ onSubmit, onSuccess, onError, }: SelectCountryStepProps): react_jsx_runtime.JSX.Element;

export { SelectCountryStep };
