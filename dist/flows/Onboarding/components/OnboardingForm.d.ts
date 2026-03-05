import * as react_jsx_runtime from 'react/jsx-runtime';
import { C as Components, J as JSFFields } from '../../../remoteFlows-DagBfxnm.js';
import { B as BasicInformationFormPayload, c as BenefitsFormPayload, C as ContractDetailsFormPayload } from '../../../types-Dz9jtnMs.js';
import 'react';
import 'yup';
import '../../../types.gen-DZuOPZbG.js';
import '../../../types-ZWIpiFgj.js';
import 'react-hook-form';
import './OnboardingBack.js';
import './OnboardingInvite.js';
import '../../../mutations-Bz0Iad09.js';
import './OnboardingSubmit.js';
import '@tanstack/query-core';
import '@remoteoss/remote-json-schema-form-kit';
import '../../useStepState.js';
import '../../types.js';
import './SaveDraftButton.js';

type OnboardingFormProps = {
    onSubmit: (payload: BasicInformationFormPayload | BenefitsFormPayload | ContractDetailsFormPayload) => Promise<void>;
    components?: Components;
    fields?: JSFFields;
    defaultValues: Record<string, unknown>;
};
declare function OnboardingForm({ defaultValues, onSubmit, components, }: OnboardingFormProps): react_jsx_runtime.JSX.Element;

export { OnboardingForm };
