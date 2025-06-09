import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import {
  CreditRiskStatus,
  CreditRiskType,
  Employment,
} from '@/src/flows/Onboarding/types';

type ReviewStepProps = {
  render: (props: {
    creditRiskType: CreditRiskType;
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

  const getCreditRiskType = (): CreditRiskType => {
    // Priority 1: Deposit required flow
    if (shouldShowDepositFlow) {
      return creditScore.showReserveInvoice
        ? 'deposit_required_successful'
        : 'deposit_required';
    }

    // Priority 2: Invite flow
    if (shouldShowInviteFlow) {
      return creditScore.showInviteSuccessful ? 'invite_successful' : 'invite';
    }

    // Default case
    return null;
  };

  const creditRiskType = getCreditRiskType();

  console.log('ReviewStep creditRiskType:', creditRiskType);

  console.log('creditScore state', { creditScore });

  return render({
    creditRiskType: creditRiskType,
    creditRiskStatus: onboardingBag.creditRiskStatus,
  });
}
