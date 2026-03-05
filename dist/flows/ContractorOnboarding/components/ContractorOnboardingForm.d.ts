import * as react_jsx_runtime from 'react/jsx-runtime';
import { C as Components, J as JSFFields } from '../../../remoteFlows-DagBfxnm.js';
import { B as BasicInformationFormPayload } from '../../../types-Dz9jtnMs.js';
import { P as PricingPlanFormPayload, a as ContractorOnboardingContractDetailsFormPayload, E as EligibilityQuestionnaireFormPayload } from '../../../types-DK7f0vaB.js';
import 'react';
import 'yup';
import '../../../types.gen-DZuOPZbG.js';
import '../../../types-ZWIpiFgj.js';
import 'react-hook-form';
import '../../Onboarding/components/OnboardingBack.js';
import '../../Onboarding/components/OnboardingInvite.js';
import '../../../mutations-Bz0Iad09.js';
import '../../Onboarding/components/OnboardingSubmit.js';
import '@tanstack/query-core';
import '@remoteoss/remote-json-schema-form-kit';
import '../../useStepState.js';
import '../../types.js';
import '../../Onboarding/components/SaveDraftButton.js';
import './OnboardingBack.js';
import './OnboardingSubmit.js';
import '../utils.js';
import '../constants.js';
import './BasicInformationStep.js';
import './ContractReviewButton.js';

type ContractorOnboardingFormProps = {
    onSubmit: (payload: BasicInformationFormPayload | PricingPlanFormPayload | ContractorOnboardingContractDetailsFormPayload | EligibilityQuestionnaireFormPayload) => Promise<void>;
    components?: Components;
    fields?: JSFFields;
    defaultValues: Record<string, unknown>;
};
declare function ContractorOnboardingForm({ defaultValues, onSubmit, components, }: ContractorOnboardingFormProps): react_jsx_runtime.JSX.Element;

export { ContractorOnboardingForm };
