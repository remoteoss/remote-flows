import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import React from 'react';

type Props = {
  title?: string;
  description?: string;
  render?: (props: {
    onboardingBag: ReturnType<typeof useOnboardingContext>['onboardingBag'];
    copy: {
      title: React.ReactNode;
      description: React.ReactNode;
    };
  }) => React.ReactNode;
  children?: React.ReactNode;
};

export const InviteSection = ({
  title,
  description,
  render,
  children,
}: Props) => {
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

  if (typeof render === 'function') {
    return render({
      onboardingBag,
      copy: { title: copyTitle, description: descriptionCopy },
    });
  }

  return (
    <div className="rmt-invite-section">
      <h2 className="rmt-invite-section-title">{title ? title : copyTitle}</h2>
      <p className="rmt-invite-section-description">
        {description ? description : descriptionCopy}
      </p>
      {children}
    </div>
  );
};
