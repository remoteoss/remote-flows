import { CreditRiskStatus } from '@remoteoss/remote-flows';

export const OnboardingAlertStatuses = ({
  creditRiskStatus,
}: {
  creditRiskStatus?: CreditRiskStatus;
}) => {
  if (creditRiskStatus === 'deposit_required') {
    return (
      <div className='alert'>
        Reserve payment required to hire this employee. Check this{' '}
        <a href='https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment'>
          support article
        </a>
      </div>
    );
  }

  if (creditRiskStatus === 'referred') {
    return (
      <div className='alert'>
        We're reviewing your company account
        <p>
          You can enter this employee's details and save them as a draft until
          our review is complete.{' '}
          <a href='https://support.remote.com/hc/en-us/articles/12696640919949-KYB-review-Why-your-company-account-is-under-review-and-what-it-means-for-payments'>
            Learn more
          </a>
        </p>
      </div>
    );
  }

  return null;
};
