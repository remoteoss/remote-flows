import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import React from 'react';

type DepositRequiredSectionProps = {
  title?: string;
  description?: string;
  render?: (props: {
    onboardingBag: ReturnType<typeof useOnboardingContext>['onboardingBag'];
    copy: {
      title: React.ReactNode;
      description: React.ReactNode;
    };
    supportLink?: string;
  }) => React.ReactNode;
  children?: React.ReactNode;
  renderChildren?: (props: {
    onboardingBag: ReturnType<typeof useOnboardingContext>['onboardingBag'];
    supportLink?: string;
  }) => React.ReactNode;
};

const copyTitle = 'Confirm Details && Continue';
const copyDescription = `If the employee's details look good, click Continue to check if
                your reserve invoice is ready for payment. After we receive
                payment, you'll be able to invite the employee to onboard to
                Remote.`;

const supportLink =
  'https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment';

export const DepositRequiredSection = ({
  title,
  description,
  render,
  renderChildren,
}: DepositRequiredSectionProps) => {
  const { onboardingBag } = useOnboardingContext();

  // TODO: do the BG call here to create a reserve invoice

  if (onboardingBag.creditRiskStatus !== 'deposit_required') {
    return null;
  }

  if (typeof render === 'function') {
    return render({
      onboardingBag,
      copy: {
        title: title || copyTitle,
        description: description || copyDescription,
      },
      supportLink: supportLink,
    });
  }

  return (
    <div className="rmt-deposit-required-section">
      <h2 className="rmt-deposit-required-title">{title || copyTitle}</h2>
      <p className="rmt-deposit-required-description">
        {description || copyDescription}
      </p>
      {renderChildren ? renderChildren({ onboardingBag, supportLink }) : null}
    </div>
  );
};
