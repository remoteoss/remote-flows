import { CreditRiskStatus } from '@remoteoss/remote-flows';

export const OnboardingAlertStatuses = ({
  creditRiskStatus,
}: {
  creditRiskStatus?: CreditRiskStatus;
}) => {
  if (creditRiskStatus === 'deposit_required') {
    return (
      <div className="alert">
        Reserve payment required to hire this employee. Check this{' '}
        <a href="https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment">
          support article
        </a>
      </div>
    );
  }

  return null;
};
