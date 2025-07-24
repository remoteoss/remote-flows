import {
  CreditRiskStatus,
  OnboardingRenderProps,
  OnboardingInviteProps,
  Employment,
  CreditRiskState,
  NormalizedFieldError,
  Meta,
} from '@remoteoss/remote-flows';
import { AlertError } from './AlertError';
import { OnboardingAlertStatuses } from './OnboardingAlertStatuses';

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
    case 'referred':
      return (
        <InviteSection
          title={`Confirm ${employment?.basic_information?.name} Profile`}
          description="Once your account is approved, you can invite your employees to Remote."
        >
          <OnboardingAlertStatuses creditRiskStatus={creditRiskStatus} />
        </InviteSection>
      );
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

function Review({ meta }: { meta: Meta }) {
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

export const MyOnboardingInviteButton = ({
  creditRiskStatus,
  Component,
  setErrors,
  canInvite,
}: {
  creditRiskStatus?: CreditRiskStatus;
  Component: React.ComponentType<OnboardingInviteProps>;
  setErrors: (errors: {
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  }) => void;
  canInvite?: boolean;
}) => {
  if (creditRiskStatus !== 'referred') {
    return (
      <Component
        disabled={!canInvite}
        className="submit-button"
        onSuccess={() => {
          console.log(
            'after inviting or creating a reserve navigate to whatever place you want',
          );
        }}
        render={({
          employmentStatus,
        }: {
          employmentStatus: 'invited' | 'created_awaiting_reserve';
        }) => {
          return employmentStatus === 'created_awaiting_reserve'
            ? 'Create Reserve'
            : 'Invite Employee';
        }}
        onError={({ error }: { error: Error }) => {
          setErrors({
            apiError: error.message,
            fieldErrors: [],
          });
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
  errors,
  setErrors,
}: {
  components: OnboardingRenderProps['components'];
  onboardingBag: OnboardingRenderProps['onboardingBag'];
  errors: {
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  };
  setErrors: (errors: {
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  }) => void;
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
        disabled={onboardingBag.isEmploymentReadOnly}
      >
        Edit Basic Information
      </button>
      <h2 className="title">Contract Details</h2>
      <Review meta={onboardingBag.meta.fields.contract_details} />
      <button
        className="back-button"
        onClick={() => onboardingBag.goTo('contract_details')}
        disabled={onboardingBag.isEmploymentReadOnly}
      >
        Edit Contract Details
      </button>
      <h2 className="title">Benefits</h2>
      <Review meta={onboardingBag.meta.fields.benefits} />

      <button
        className="back-button"
        onClick={() => onboardingBag.goTo('benefits')}
        disabled={onboardingBag.isEmploymentReadOnly}
      >
        Edit Benefits
      </button>
      <h2 className="title">Review</h2>
      <ReviewStepCreditRisk
        render={({
          creditRiskState,
          creditRiskStatus,
        }: {
          creditRiskState: CreditRiskState;
          creditRiskStatus?: CreditRiskStatus;
        }) => {
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
                  disabled={onboardingBag.isEmploymentReadOnly}
                >
                  Back
                </BackButton>
                <MyOnboardingInviteButton
                  creditRiskStatus={creditRiskStatus}
                  Component={OnboardingInvite}
                  setErrors={setErrors}
                  canInvite={onboardingBag.canInvite}
                />
              </div>
              <AlertError errors={errors} />
            </>
          );
        }}
      />
    </div>
  );
};
export default ReviewStep;
