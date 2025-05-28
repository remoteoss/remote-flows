import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { ReactNode } from 'react';
import React from 'react';

const DefaultSection = ({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  children?: ReactNode;
}) => (
  <div className="rmt-invitation-section">
    <h2 className="rmt-invitation-title">{title}</h2>
    <p className="rmt-invitation-description">{description}</p>
    {children}
  </div>
);

const copy = {
  deposit_required: {
    title: 'Confirm Details && Continue',
    description: `If the employee's details look good, click Continue to check if
                your reserve invoice is ready for payment. After we receive
                payment, you'll be able to invite the employee to onboard to
                Remote.`,
    supportLink:
      'https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment',
  },
};

type InvitationSectionProps = {
  render: (props: {
    onboardingBag: ReturnType<typeof useOnboardingContext>['onboardingBag'];
    props: {
      title: React.ReactNode;
      description: React.ReactNode;
      supportLink?: string;
    };
    DefaultComponent: ({
      title,
      description,
      children,
    }: {
      title?: React.ReactNode;
      description?: React.ReactNode;
      children?: ReactNode;
    }) => React.ReactNode;
  }) => React.ReactNode;
};

export const InvitationSection = ({ render }: InvitationSectionProps) => {
  const { onboardingBag } = useOnboardingContext();

  // TODO: do the BG call here to create a reserve invoice when creditRiskStatus is 'deposit_required'
  const { creditRiskStatus } = onboardingBag;
  const props = copy[creditRiskStatus as keyof typeof copy] ?? {
    title: (
      <>
        Ready to invite{' '}
        {onboardingBag.stepState.values?.basic_information?.name} to complete
        their onboarding?
      </>
    ),
    description: (
      <>
        If you're ready to invite this employee to onboard with Remote, click
        the button below.
      </>
    ),
  };

  return render({
    onboardingBag,
    props: props,
    DefaultComponent: ({ title, description, children }) => (
      <DefaultSection
        title={title || props.title}
        description={description || props.description}
        children={children}
      />
    ),
  });
};
