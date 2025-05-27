import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import React, { ReactNode } from 'react';

type Props = {
  title?: string;
  description?: string;
  render: (props: {
    onboardingBag: ReturnType<typeof useOnboardingContext>['onboardingBag'];
    props: {
      title: React.ReactNode;
      description: React.ReactNode;
    };
    DefaultComponent: ({
      children,
    }: {
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

export const InviteSection = ({ title, description, render }: Props) => {
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

  const descriptionCopy = (
    <>
      If you're ready to invite this employee to onboard with Remote, click the
      button below.
    </>
  );

  const finalTitle = title || copyTitle;
  const finalDescription = description || descriptionCopy;

  return render({
    onboardingBag,
    props: { title: finalTitle, description: finalDescription },
    DefaultComponent: ({ children }: { children?: ReactNode }) => (
      <DefaultComponent
        title={finalTitle}
        description={finalDescription}
        children={children}
      />
    ),
  });
};
