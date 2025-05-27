import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import React, { ReactNode } from 'react';

type Props = {
  render: (props: {
    onboardingBag: ReturnType<typeof useOnboardingContext>['onboardingBag'];
    props: {
      title: React.ReactNode;
      description: React.ReactNode;
    };
    DefaultComponent: ({
      children,
    }: {
      title?: React.ReactNode;
      description?: React.ReactNode;
      children?: ReactNode;
    }) => React.ReactNode;
  }) => React.ReactNode;
};

const DefaultComponent = ({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  children?: React.ReactNode;
}) => {
  return (
    <div className="rmt-invite-section">
      <h2 className="rmt-invite-section-title">{title}</h2>
      <p className="rmt-invite-section-description">{description}</p>
      {children}
    </div>
  );
};

export const InviteSection = ({ render }: Props) => {
  const { onboardingBag } = useOnboardingContext();

  if (onboardingBag.creditRiskStatus === 'deposit_required') {
    return null;
  }

  const copyTitle = (
    <>
      Ready to invite {onboardingBag.stepState.values?.basic_information?.name}{' '}
      to complete their onboarding?
    </>
  );

  const copyDescription = (
    <>
      If you're ready to invite this employee to onboard with Remote, click the
      button below.
    </>
  );

  return render({
    onboardingBag,
    props: { title: copyTitle, description: copyDescription },
    DefaultComponent: ({
      title,
      description,
      children,
    }: {
      title?: ReactNode;
      description?: ReactNode;
      children?: ReactNode;
    }) => (
      <DefaultComponent
        title={title || copyTitle}
        description={description || copyDescription}
        children={children}
      />
    ),
  });
};
