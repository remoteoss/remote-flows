import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import {
  CreditRiskStatus,
  CreditRiskVariant,
  Employment,
} from '@/src/flows/Onboarding/types';
import { useState } from 'react';

type CreditRiskProps = {
  render: (props: {
    variant: CreditRiskVariant;
    creditRiskStatus: CreditRiskStatus | undefined;
    setShowReserveInvoice: (value: boolean) => void;
    setShowInviteSuccessful: (value: boolean) => void;
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

export function CreditRisk({ render }: CreditRiskProps) {
  const { onboardingBag } = useOnboardingContext();

  const [showReserveInvoice, setShowReserveInvoice] = useState(false);
  const [showInviteSuccessful, setShowInviteSuccessful] = useState(false);

  const showDepositRequiredSection =
    !showReserveInvoice &&
    onboardingBag.creditRiskStatus === 'deposit_required' &&
    onboardingBag.employment?.status &&
    !statusesToNotShowDeposit.includes(onboardingBag.employment?.status);

  const showDepositRequiredSuccesfulSection =
    onboardingBag.creditRiskStatus === 'deposit_required' &&
    showReserveInvoice &&
    onboardingBag.employment?.status &&
    !statusesToNotShowDeposit.includes(onboardingBag.employment?.status);

  const showInviteSection =
    (!showInviteSuccessful &&
      onboardingBag.creditRiskStatus &&
      !CREDIT_RISK_STATUSES.includes(onboardingBag.creditRiskStatus)) ||
    (!showInviteSuccessful &&
      onboardingBag.employment?.status &&
      statusesToNotShowDeposit.includes(onboardingBag.employment?.status));

  const showInviteSuccesfulSection =
    (onboardingBag.creditRiskStatus &&
      !CREDIT_RISK_STATUSES.includes(onboardingBag.creditRiskStatus) &&
      showInviteSuccessful) ||
    (showInviteSuccessful &&
      onboardingBag.employment?.status &&
      statusesToNotShowDeposit.includes(onboardingBag.employment?.status));

  const getVariant = () => {
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

  return render({
    variant: getVariant(),
    creditRiskStatus: onboardingBag.creditRiskStatus,
    setShowReserveInvoice,
    setShowInviteSuccessful,
  });
}
