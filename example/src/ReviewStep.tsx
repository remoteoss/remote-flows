import { OnboardingAlertStatuses } from './OnboardingAlertStatuses';
import {
  CreditRiskStatus,
  OnboardingRenderProps,
  OnboardingInviteProps,
  Employment,
  CreditRiskState,
} from '@remoteoss/remote-flows';
export const InviteSection = ({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  children?: React.ReactNode;
}) => {
  return (
    <div className="rmt-invitation-section">
      <h2 className="rmt-invitation-title">{title}</h2>
      <p className="rmt-invitation-description">{description}</p>
      {children}
    </div>
  );
};

const CreditRiskSections = ({
  creditRiskState,
  creditRiskStatus,
  employment,
}: {
  creditRiskState: CreditRiskState;
  creditRiskStatus?: CreditRiskStatus;
  employment?: Employment;
}) => {
  switch (creditRiskState) {
    case 'deposit_required':
      return (
        <InviteSection
          title="Confirm Details && Continue"
          description="If the employee's details look good, click Continue to check if your reserve invoice is ready for payment. After we receive payment, you'll be able to invite the employee to onboard to Remote."
        >
          <OnboardingAlertStatuses creditRiskStatus={creditRiskStatus} />
          <a href="https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment">
            What is a reserve payment
          </a>
        </InviteSection>
      );
    case 'deposit_required_successful':
      return (
        <div className="reserve-invoice">
          <h2>You’ll receive a reserve invoice soon</h2>
          <p>
            We saved {employment?.basic_information?.name as string} details as
            a draft. You’ll be able to invite them to Remote after you complete
            the reserve payment.
          </p>
          <div>
            <button type="submit">Go to dashboard</button>

            <br />

            <a href="https://support.remote.com/hc/en-us/articles/12695731865229-What-is-a-reserve-payment">
              What is a reserve payment
            </a>
          </div>
        </div>
      );
    case 'invite':
      return (
        <InviteSection
          title={`Ready to invite ${employment?.basic_information?.name} to Remote?`}
          description="If you're ready to invite this employee to onboard with Remote, click the button below."
        />
      );
    case 'invite_successful':
      return (
        <div className="invite-successful">
          <h2>You’re all set!</h2>
          <p>
            {employment?.basic_information?.name as string} at{' '}
            {employment?.basic_information?.personal_email as string} has been
            invited to Remote. We’ll let you know once they complete their
            onboarding process
          </p>
          <div>
            <button type="submit">Go to dashboard</button>
          </div>
        </div>
      );
    default:
      return null;
  }
};

function Review({
  meta,
}: {
  meta: Record<string, { label?: string; prettyValue?: string | boolean }>;
}) {
  return (
    <div className="onboarding-values">
      {Object.entries(meta).map(([key, value]) => {
        const label = value?.label;
        const prettyValue = value?.prettyValue;

        // Skip if there's no label or prettyValue is undefined or empty string
        if (!label || prettyValue === undefined || prettyValue === '') {
          return null;
        }

        // Handle boolean prettyValue
        const displayValue =
          typeof prettyValue === 'boolean'
            ? prettyValue
              ? 'Yes'
              : 'No'
            : prettyValue;

        return (
          <pre key={key}>
            {label}: {displayValue}
          </pre>
        );
      })}
    </div>
  );
}

const DISABLED_BUTTON_EMPLOYMENT_STATUS: Employment['status'][] = [
  'created_awaiting_reserve',
  'invited',
];

export const MyOnboardingInviteButton = ({
  creditRiskStatus,
  Component,
  setApiError,
  employment,
}: {
  creditRiskStatus?: CreditRiskStatus;
  Component: React.ComponentType<OnboardingInviteProps>;
  setApiError: (error: string | null) => void;
  employment?: Employment;
}) => {
  const isDisabled =
    employment &&
    DISABLED_BUTTON_EMPLOYMENT_STATUS.includes(employment?.status);
  if (creditRiskStatus !== 'referred') {
    return (
      <Component
        disabled={isDisabled}
        className="submit-button"
        onSuccess={() => {
          console.log(
            'after inviting or creating a reserve navigate to whatever place you want',
          );
        }}
        render={({ employmentStatus }) => {
          return employmentStatus === 'created_awaiting_reserve'
            ? 'Create Reserve'
            : 'Invite Employee';
        }}
        onError={(error: unknown) => {
          if (error instanceof Error) {
            setApiError(error.message);
          } else if (typeof error === 'string') {
            setApiError(error);
          } else {
            setApiError('An unknown error occurred');
          }
        }}
        type="submit"
      />
    );
  }
  return null;
};

export const ReviewStep = ({
  onboardingBag,
  components,
  setApiError,
}: {
  components: OnboardingRenderProps['components'];
  onboardingBag: OnboardingRenderProps['onboardingBag'];
  setApiError: (error: string | null) => void;
}) => {
  const {
    OnboardingInvite,
    BackButton,
    ReviewStep: ReviewStepCreditRisk,
  } = components;

  return (
    <div className="onboarding-review">
      <h2 className="title">Basic Information</h2>
      <Review meta={onboardingBag.meta.fields.basic_information} />
      <button
        className="back-button"
        onClick={() => onboardingBag.goTo('basic_information')}
      >
        Edit Basic Information
      </button>
      <h2 className="title">Contract Details</h2>
      <Review meta={onboardingBag.meta.fields.contract_details} />
      <button
        className="back-button"
        onClick={() => onboardingBag.goTo('contract_details')}
      >
        Edit Contract Details
      </button>
      <h2 className="title">Benefits</h2>
      <Review meta={onboardingBag.meta.fields.benefits} />

      <button
        className="back-button"
        onClick={() => onboardingBag.goTo('benefits')}
      >
        Edit Benefits
      </button>
      <h2 className="title">Review</h2>
      {onboardingBag.creditRiskStatus === 'referred' && (
        <InviteSection
          title={`Confirm ${onboardingBag.employment?.basic_information?.name} Profile`}
          description="Once your account is approved, you can invite your employees to Remote."
        >
          <OnboardingAlertStatuses
            creditRiskStatus={onboardingBag.creditRiskStatus}
          />
        </InviteSection>
      )}
      <ReviewStepCreditRisk
        render={({ creditRiskState, creditRiskStatus }) => {
          return (
            <>
              <CreditRiskSections
                creditRiskState={creditRiskState}
                creditRiskStatus={creditRiskStatus}
                employment={onboardingBag.employment}
              />
              <div className="buttons-container">
                <BackButton
                  className="back-button"
                  onClick={() => setApiError(null)}
                >
                  Back
                </BackButton>
                <MyOnboardingInviteButton
                  creditRiskStatus={onboardingBag.creditRiskStatus}
                  Component={OnboardingInvite}
                  setApiError={setApiError}
                  employment={onboardingBag.employment}
                />
              </div>
            </>
          );
        }}
      />
    </div>
  );
};
export default ReviewStep;
