import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import React, { ReactNode } from 'react';

export const copyTitle = 'Confirm Details && Continue';
export const copyDescription = `If the employee's details look good, click Continue to check if
                your reserve invoice is ready for payment. After we receive
                payment, you'll be able to invite the employee to onboard to
                Remote.`;

export const supportLink =
  'https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment';

type DepositRequiredSectionProps = {
  title?: string;
  description?: string;
  render: (props: {
    onboardingBag: ReturnType<typeof useOnboardingContext>['onboardingBag'];
    props: {
      title: React.ReactNode;
      description: React.ReactNode;
      supportLink: string;
    };
    DefaultComponent: ({
      children,
    }: {
      children?: ReactNode;
    }) => React.ReactNode;
  }) => React.ReactNode;
};

// Default component that can be reused by consumers
const DefaultDepositRequiredSection = ({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  children?: ReactNode;
}) => (
  <div className="rmt-deposit-required-section">
    <h2 className="rmt-deposit-required-title">{title}</h2>
    <p className="rmt-deposit-required-description">{description}</p>
    {children}
  </div>
);

export const DepositRequiredSection = ({
  title,
  description,
  render,
}: DepositRequiredSectionProps) => {
  const { onboardingBag } = useOnboardingContext();

  // TODO: do the BG call here to create a reserve invoice

  if (onboardingBag.creditRiskStatus !== 'deposit_required') {
    return null;
  }

  const finalTitle = title || copyTitle;
  const finalDescription = description || copyDescription;

  return render({
    onboardingBag,
    props: {
      title: finalTitle,
      description: finalDescription,
      supportLink,
    },
    DefaultComponent: ({ children }: { children?: ReactNode }) => (
      <DefaultDepositRequiredSection
        title={finalTitle}
        description={finalDescription}
      >
        {children}
      </DefaultDepositRequiredSection>
    ),
  });
};
