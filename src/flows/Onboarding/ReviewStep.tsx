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

  const isDepositRequired =
    onboardingBag.creditRiskStatus === 'deposit_required' &&
    onboardingBag.employment?.status &&
    !statusesToNotShowDeposit.includes(onboardingBag.employment?.status);

  const showDepositRequiredSection =
    !creditScore.showReserveInvoice && isDepositRequired;

  const showDepositRequiredSuccesfulSection =
    creditScore.showReserveInvoice && isDepositRequired;

  const showInviteSection =
    (!creditScore.showInviteSuccessful &&
      onboardingBag.creditRiskStatus &&
      !CREDIT_RISK_STATUSES.includes(onboardingBag.creditRiskStatus)) ||
    (!creditScore.showInviteSuccessful &&
      onboardingBag.employment?.status &&
      statusesToNotShowDeposit.includes(onboardingBag.employment?.status));

  const showInviteSuccesfulSection =
    (onboardingBag.creditRiskStatus &&
      !CREDIT_RISK_STATUSES.includes(onboardingBag.creditRiskStatus) &&
      creditScore.showInviteSuccessful) ||
    (creditScore.showInviteSuccessful &&
      onboardingBag.employment?.status &&
      statusesToNotShowDeposit.includes(onboardingBag.employment?.status));

  const getCreditRiskType = () => {
    if (showDepositRequiredSection) {
      return 'deposit_required';
    }
    if (showDepositRequiredSuccesfulSection) {
      return 'deposit_required_successful';
    }
    if (showInviteSection) {
      return 'invite';
    }
    if (showInviteSuccesfulSection) {
      return 'invite_successful';
    }
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
