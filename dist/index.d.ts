export { CostCalculatorFlow, CostCalculatorFlowProps } from './flows/CostCalculator/CostCalculatorFlow.js';
export { CostCalculatorForm } from './flows/CostCalculator/CostCalculatorForm.js';
export { CostCalculatorSubmitButton } from './flows/CostCalculator/CostCalculatorSubmitButton.js';
export { CostCalculatorResetButton } from './flows/CostCalculator/CostCalculatorResetButton.js';
export { useCostCalculator } from './flows/CostCalculator/hooks.js';
export { useCostCalculatorEstimationCsv, useCostCalculatorEstimationPdf } from './flows/CostCalculator/api.js';
export { EstimationResults } from './flows/CostCalculator/EstimationResults/EstimationResults.js';
export { SummaryResults } from './flows/CostCalculator/SummaryResults/SummaryResults.js';
export { buildPayload as buildCostCalculatorEstimationPayload } from './flows/CostCalculator/utils.js';
export { CostCalculatorEstimation, CostCalculatorEstimationFormValues, CostCalculatorEstimationOptions, CostCalculatorEstimationResponse, CostCalculatorEstimationSubmitValues, CurrencyKey, EstimationError, UseCostCalculatorOptions } from './flows/CostCalculator/types.js';
export { ContractAmendmentConfirmationForm } from './flows/ContractAmendment/ContractAmendmentConfirmationForm.js';
export { ContractAmendmentFlow, ContractAmendmentRenderProps } from './flows/ContractAmendment/ContractAmendmentFlow.js';
export { ContractAmendmentForm } from './flows/ContractAmendment/ContractAmendmentForm.js';
export { ContractAmendmentSubmit } from './flows/ContractAmendment/ContractAmendmentSubmit.js';
export { useContractAmendment } from './flows/ContractAmendment/hooks.js';
export { TerminationFlow } from './flows/Termination/TerminationFlow.js';
export { TerminationReasonsDetailContent } from './flows/Termination/components/TerminationReasonsDetailContent/TerminationReasonsDetailContent.js';
export { TerminationDialogInfoContent } from './flows/Termination/components/TerminationDialogInfoContent/TerminationDialogInfoContent.js';
export { A as AdditionalDetailsFormValues, E as EmployeeCommunicationFormValues, P as PaidTimeOffFormValues, c as TerminationDetailsFormValues, a as TerminationFlowProps, T as TerminationFormValues, b as TerminationRenderProps } from './types-Dq-2OENN.js';
export { PaidTimeOffProps } from './flows/Termination/components/PaidTimeOff/PaidTimeOff.js';
export { AcknowledgeInformationFeesProps } from './flows/Termination/components/AcknowledgeInformation/AcknowledgeInformationFees.js';
export { AcknowledgeInformationProps } from './flows/Termination/components/AcknowledgeInformation/AcknowledgeInformation.js';
export { OnboardingFlow } from './flows/Onboarding/OnboardingFlow.js';
export { OnboardingInviteProps } from './flows/Onboarding/components/OnboardingInvite.js';
export { B as BasicInformationFormPayload, c as BenefitsFormPayload, C as ContractDetailsFormPayload, e as CreditRiskState, d as CreditRiskStatus, E as Employment, f as OnboardingRenderProps, a as SelectCountryFormPayload, b as SelectCountrySuccess } from './types-BAWh17UT.js';
export { ContractorOnboardingFlow } from './flows/ContractorOnboarding/ContractorOnboarding.js';
export { e as ContractPreviewFormPayload, f as ContractPreviewResponse, a as ContractorOnboardingContractDetailsFormPayload, d as ContractorOnboardingContractDetailsResponse, C as ContractorOnboardingFlowProps, b as ContractorOnboardingRenderProps, E as EligibilityQuestionnaireFormPayload, g as EligibilityQuestionnaireResponse, P as PricingPlanFormPayload, c as PricingPlanResponse } from './types-Ba9j16SK.js';
export { contractorPlusProductIdentifier, contractorStandardProductIdentifier, corProductIdentifier, eorProductIdentifier, onboardingWorkflows, pricingPlanDetails } from './flows/ContractorOnboarding/constants.js';
export { ContractPreviewStatementProps } from './flows/ContractorOnboarding/components/ContractPreviewStatement.js';
export { CreateCompanyFlow } from './flows/CreateCompany/CreateCompany.js';
export { c as CompanyAddressDetailsSuccess, b as CompanyBasicInfoSuccess, C as CreateCompanyFlowProps, a as CreateCompanyRenderProps } from './types-DP9U0M1b.js';
import * as _tanstack_react_query from '@tanstack/react-query';
import { UseQueryResult } from '@tanstack/react-query';
import { a7 as MagicLinkResponse, U as UnprocessableEntityResponse, a8 as MagicLinkParams, a9 as GetShowEmploymentResponse, S as SuccessResponse, T as TooManyRequestsResponse, B as BadRequestResponse } from './types.gen-BSxAhJ_V.js';
export { w as Company, C as ContractAmendmentAutomatableResponse, o as CostCalculatorEmployment, i as CostCalculatorEstimateResponse, aa as Currency, d as EmploymentCreationResponse, e as EmploymentResponse, O as OffboardingResponse } from './types.gen-BSxAhJ_V.js';
import { $ as $TSFixMe, R as RemoteFlowsSDKProps } from './remoteFlows-S2ZmIMR3.js';
export { B as ButtonComponentProps, C as Components, f as CountryComponentProps, g as DatePickerComponentProps, D as DrawerComponentProps, d as FieldComponentProps, F as FieldSetToggleComponentProps, e as FileComponentProps, b as JSFCustomComponentProps, M as Meta, P as PDFPreviewComponentProps, h as PricingPlanComponentProps, i as PricingPlanDataProps, S as StatementComponentProps, T as TextFieldComponentProps, W as WorkScheduleComponentProps, Z as ZendeskDrawerComponentProps } from './remoteFlows-S2ZmIMR3.js';
export { b as usePaidTimeoffBreakdownQuery, c as useTimeOffLeavePoliciesSummaryQuery, u as useTimeOffQuery } from './types-Bt3Nvzma.js';
export { t as transformYupErrorsIntoObject } from './utils-BaHnOWNw.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { PropsWithChildren } from 'react';
export { F as FieldError, N as NormalizedFieldError } from './mutations-C70g1hf2.js';
import 'yup';
import './types-ZWIpiFgj.js';
import 'react-hook-form';
import './flows/CostCalculator/constants.js';
import './flows/types.js';
import '@remoteoss/remote-json-schema-form-kit';
import './flows/ContractAmendment/ContractAmendmentBack.js';
import './flows/ContractAmendment/types.js';
import '@remoteoss/json-schema-form';
import '@remoteoss/json-schema-form-v0-deprecated';
import './flows/useStepState.js';
import './flows/Termination/TerminationBack.js';
import './flows/Termination/TerminationSubmit.js';
import '@tanstack/query-core';
import './flows/Termination/api.js';
import './flows/Onboarding/components/OnboardingBack.js';
import './flows/Onboarding/components/OnboardingSubmit.js';
import './flows/Onboarding/components/SaveDraftButton.js';
import './flows/Termination/components/AcknowledgeInformation/types.js';
import './flows/Termination/components/AcknowledgeInformation/constants.js';
import './flows/ContractorOnboarding/components/OnboardingBack.js';
import './flows/ContractorOnboarding/components/OnboardingSubmit.js';
import './flows/ContractorOnboarding/utils.js';
import './flows/ContractorOnboarding/components/BasicInformationStep.js';
import './flows/ContractorOnboarding/components/ContractReviewButton.js';
import './flows/CreateCompany/components/CreateCompanySubmit.js';
import './flows/CreateCompany/utils.js';
import 'clsx';

declare const useMagicLink: () => _tanstack_react_query.UseMutationResult<({
    data: MagicLinkResponse;
    error: undefined;
} | {
    data: undefined;
    error: UnprocessableEntityResponse;
}) & {
    request: Request;
    response: Response;
}, Error, MagicLinkParams, unknown>;

/**
 * Hook to retrieve employment details for a specific employment ID.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} params.employmentId - The ID of the employment to fetch details for.
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the employment details.
 */
declare const useEmploymentQuery: ({ employmentId, queryParams, }: {
    employmentId: string;
    queryParams?: $TSFixMe;
}) => UseQueryResult<GetShowEmploymentResponse["data"]["employment"], unknown>;
/**
 * Hook to discard an employment.
 *
 * @returns {UseMutationResult<void, unknown, { employmentId: string }, unknown>} - The mutation result.
 */
declare const useDiscardEmploymentMutation: () => _tanstack_react_query.UseMutationResult<({
    data: SuccessResponse;
    error: undefined;
} | {
    data: undefined;
    error: UnprocessableEntityResponse | TooManyRequestsResponse | BadRequestResponse;
}) & {
    request: Request;
    response: Response;
}, Error, {
    employmentId: string;
}, unknown>;

declare function RemoteFlows({ auth, children, components, theme, proxy, environment, errorBoundary, debug, credentials, }: PropsWithChildren<RemoteFlowsSDKProps>): react_jsx_runtime.JSX.Element;

declare function convertFromCents(amount?: number | string | null): number | null;

declare const zendeskArticles: {
    /**
     * Disclaimer for Cost Calculator
     * Access: Private (Need Remote account to access)
     * https://support.remote.com/hc/en-us/articles/4668194326797
     */
    disclaimerCostCalculator: number;
    /**
     * Guide for engaging contractors
     * Access: private (Need Remote account to access)
     * https://support.remote.com/hc/en-us/articles/43161434169613
     */
    engagingContractors: number;
    /**
     * Employee Onboarding Timeline
     * Access: Private (Need Remote account to access)
     * https://support.remote.com/hc/en-us/articles/4411262104589
     */
    employeeOnboardingTimeline: number;
    /**
     * Extra Payments
     * Access: Public (Everyone can access)
     * https://support.remote.com/hc/en-us/articles/4466822781709
     */
    extraPayments: number;
    /**
     * International Pricing
     * Access: Public (Everyone can access)
     * https://support.remote.com/hc/en-us/articles/4410698586893
     */
    internationalPricing: number;
    /**
     * Pricing Plan Options
     * Access: Private (Need Remote account to access)
     * https://support.remote.com/hc/en-us/articles/43161720465421
     */
    pricingPlanOptions: number;
    /**
     * IR35 Status
     * Access: Private (Need Remote account to access)
     * https://support.remote.com/hc/en-us/articles/42810224523917
     */
    ir35Status: number;
    /**
     * Remote FX Rate
     * Access: Public (Everyone can access)
     * https://support.remote.com/hc/en-us/articles/33271144977421
     */
    remoteFxRate: number;
    /**
     * Employee Communication for Terminations
     * Access: Public (Everyone can access)
     * https://support.remote.com/hc/en-us/articles/4411585179661
     */
    terminationEmployeeCommunication: number;
    /**
     * Notice Period for Terminations by Country
     * Access: Public (Everyone can access)
     * https://support.remote.com/hc/en-us/articles/5831900985613
     */
    terminationNoticePeriods: number;
    /**
     * Involuntary Offboarding Service Charge
     * Access: Private (Need Remote account to access)
     * https://support.remote.com/hc/en-us/articles/4406932229133
     */
    involuntaryOffboardingServiceCharge: number;
    /**
     * Reconciliation Invoice
     * Access: Public (Everyone can access)
     * https://support.remote.com/hc/en-us/articles/17604014808589
     */
    reconciliationInvoice: number;
};

interface ZendeskTriggerButtonProps {
    /**
     * The Zendesk ID for the help article
     */
    zendeskId: number;
    /**
     * The class name for the button
     */
    className?: string;
    /**
     * The callback function to be called when the button is clicked
     */
    onClick?: (zendeskId: number) => void;
    /**
     * The children to be rendered inside the button
     */
    children?: React.ReactNode;
    /**
     * Whether to open the help article in a new tab
     */
    external?: boolean;
}
declare function ZendeskTriggerButton({ zendeskId, className, onClick, children, external, }: ZendeskTriggerButtonProps): react_jsx_runtime.JSX.Element;

export { $TSFixMe, RemoteFlows, RemoteFlowsSDKProps, SuccessResponse, ZendeskTriggerButton, convertFromCents, useDiscardEmploymentMutation, useEmploymentQuery, useMagicLink, zendeskArticles };
