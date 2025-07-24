import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import {
  CreditRiskStatus,
  CreditRiskState,
  Employment,
} from '@/src/flows/Onboarding/types';

type ReviewStepProps = {
  /**
   * Render prop function for customizing the review step credit risk flow UI
   *
   * @param props - Object containing credit risk information
   * @param props.creditRiskState - Current state of the credit risk flow
   *   - 'referred': Company has been referred for manual review
   *   - 'deposit_required': Deposit payment is required but not yet paid
   *   - 'deposit_required_successful': Deposit payment has been successfully processed
   *   - 'invite': Regular invite flow is available (no deposit required)
   *   - 'invite_successful': Invitation has been successfully sent
   *   - null: No specific credit risk state applies
   *
   * @param props.creditRiskStatus - Credit risk status from the backend
   *   - 'not_started': Credit risk assessment has not been initiated
   *   - 'ready': Ready for credit risk assessment
   *   - 'in_progress': Credit risk assessment is in progress
   *   - 'referred': Company has been referred for manual review
   *   - 'fail': Credit risk assessment failed
   *   - 'deposit_required': Company requires a deposit payment
   *   - 'no_deposit_required': No deposit is required for this company
   *   - undefined: Credit risk status not yet determined
   * @returns React.ReactNode to render for the review step
   */
  render: (props: {
    creditRiskState: CreditRiskState;
    creditRiskStatus: CreditRiskStatus | undefined;
  }) => React.ReactNode;
};

const statusesToNotShowDeposit: Employment['status'][] = [
  'invited',
  'created_reserve_paid',
];

const CREDIT_RISK_STATUSES: CreditRiskStatus[] = [
  'deposit_required',
  'referred',
];

export function ReviewStep({ render }: ReviewStepProps) {
  const { onboardingBag, creditScore } = useOnboardingContext();

  // Helper variables to make logic more readable
  const isDepositRequiredCreditRisk =
    onboardingBag.creditRiskStatus === 'deposit_required';

  const isReferred = onboardingBag.creditRiskStatus === 'referred';

  const hasEmploymentStatusThatHidesDeposit =
    onboardingBag.employment?.status &&
    statusesToNotShowDeposit.includes(onboardingBag.employment.status);

  const isCreditRiskStatusInExclusionList =
    onboardingBag.creditRiskStatus &&
    CREDIT_RISK_STATUSES.includes(onboardingBag.creditRiskStatus);

  const shouldShowDepositFlow =
    isDepositRequiredCreditRisk &&
    onboardingBag.employment?.status &&
    !hasEmploymentStatusThatHidesDeposit;

  const shouldShowInviteFlow =
    (onboardingBag.creditRiskStatus && !isCreditRiskStatusInExclusionList) ||
    (onboardingBag.employment?.status && hasEmploymentStatusThatHidesDeposit);

  const getCreditRiskState = (): CreditRiskState => {
    // check if the company is referred
    if (isReferred) {
      return 'referred';
    }

    // Deposit required flow
    if (shouldShowDepositFlow) {
      return creditScore.showReserveInvoice
        ? 'deposit_required_successful'
        : 'deposit_required';
    }

    // Invite flow
    if (shouldShowInviteFlow) {
      return creditScore.showInviteSuccessful ? 'invite_successful' : 'invite';
    }

    // Default case
    return null;
  };

  const creditRiskState = getCreditRiskState();

  return render({
    creditRiskState,
    creditRiskStatus: onboardingBag.creditRiskStatus,
  });
}
