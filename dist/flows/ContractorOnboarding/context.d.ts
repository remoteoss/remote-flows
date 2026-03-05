import * as _tanstack_query_core from '@tanstack/query-core';
import * as _remoteoss_remote_json_schema_form_kit from '@remoteoss/remote-json-schema-form-kit';
import { J as JSFFields, M as Meta, a as JSFFieldset } from '../../remoteFlows-DI0ouAyb.js';
import { k as EmploymentCreationResponse, S as SuccessResponse, l as EmploymentResponse, m as CreateContractDocumentResponse, E as Employment, n as Signatory, o as CompanyLegalEntity } from '../../types.gen-BxpagbHP.js';
import * as react from 'react';
import { RefObject } from 'react';
import * as react_hook_form from 'react-hook-form';
import { UseFormSetValue } from 'react-hook-form';
import { Step } from '../useStepState.js';
import { u as useContractorOnboarding } from '../../types-D4mEhDNr.js';
import { StepKeys } from './utils.js';
import 'yup';
import '../../types-ZWIpiFgj.js';
import './components/OnboardingBack.js';
import 'react/jsx-runtime';
import './components/OnboardingSubmit.js';
import '../../mutations-BKtilfHK.js';
import './components/BasicInformationStep.js';
import '../../types-DdtBq-tA.js';
import '../Onboarding/components/OnboardingBack.js';
import '../Onboarding/components/OnboardingInvite.js';
import '../Onboarding/components/OnboardingSubmit.js';
import '../types.js';
import '../Onboarding/components/SaveDraftButton.js';
import './components/ContractReviewButton.js';
import './constants.js';

declare const ContractorOnboardingContext: react.Context<{
    formId: string | undefined;
    contractorOnboardingBag: ReturnType<typeof useContractorOnboarding> | null;
    formRef?: {
        setValue: RefObject<UseFormSetValue<Record<string, unknown>> | undefined>;
    };
}>;
declare const useContractorOnboardingContext: () => {
    readonly formId: string;
    readonly contractorOnboardingBag: {
        isLoading: boolean;
        fieldValues: react_hook_form.FieldValues;
        stepState: {
            currentStep: Step<StepKeys>;
            totalSteps: number;
            values: {
                review: react_hook_form.FieldValues;
                contract_details: react_hook_form.FieldValues;
                select_country: react_hook_form.FieldValues;
                basic_information: react_hook_form.FieldValues;
                eligibility_questionnaire: react_hook_form.FieldValues;
                contract_preview: react_hook_form.FieldValues;
                pricing_plan: react_hook_form.FieldValues;
            } | null;
        };
        checkFieldUpdates: react.Dispatch<react.SetStateAction<react_hook_form.FieldValues>>;
        back: () => void;
        next: () => void;
        goTo: (step: StepKeys) => void;
        onSubmit: (values: react_hook_form.FieldValues) => Promise<EmploymentCreationResponse | SuccessResponse | EmploymentResponse | CreateContractDocumentResponse | {
            data: {
                countryCode: any;
            };
        } | {
            data: {
                subscription: any;
            };
        } | undefined>;
        fields: JSFFields;
        meta: {
            fields: {
                select_country: Meta;
                basic_information: Meta;
                contract_details: Meta;
                contract_preview: Meta;
                pricing_plan: Meta;
                eligibility_questionnaire: Meta;
            };
            fieldsets: JSFFieldset | null | undefined;
        };
        parseFormValues: (values: react_hook_form.FieldValues) => Promise<react_hook_form.FieldValues>;
        handleValidation: (values: react_hook_form.FieldValues) => Promise<_remoteoss_remote_json_schema_form_kit.ValidationResult | null>;
        initialValues: {
            select_country: Record<string, unknown>;
            basic_information: Record<string, unknown>;
            contract_details: Record<string, unknown>;
            contract_preview: Record<string, unknown>;
            pricing_plan: Record<string, unknown>;
            eligibility_questionnaire: Record<string, unknown>;
        };
        employmentId: string | undefined;
        refetchEmployment: (options?: _tanstack_query_core.RefetchOptions) => Promise<_tanstack_query_core.QueryObserverResult<(Employment & {
            termination_date?: string | null;
        }) | undefined, unknown>>;
        isSubmitting: boolean;
        documentPreviewPdf: {
            contract_document: {
                content: string;
                name?: string | undefined;
                signatories?: Signatory[] | undefined;
                status?: "archived" | "draft" | "awaiting_signatures" | "finished" | "revised" | "awaiting_customer_approval" | "approved_by_customer" | "rejected_by_customer" | undefined;
            };
        } | undefined;
        canInvite: boolean | undefined;
        isEmploymentReadOnly: boolean | undefined;
        invitedStatus: "invited" | "not_invited";
        employment: (Employment & {
            termination_date?: string | null;
        }) | undefined;
        defaultLegalEntity: CompanyLegalEntity | undefined;
        steps: {
            name: StepKeys;
            index: number;
            label: string;
            visible: boolean;
        }[];
    };
    readonly formRef: {
        setValue: RefObject<UseFormSetValue<Record<string, unknown>> | undefined>;
    } | undefined;
};

export { ContractorOnboardingContext, useContractorOnboardingContext };
