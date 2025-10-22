import {
  ContractorOnboardingRenderProps,
  NormalizedFieldError,
} from '@remoteoss/remote-flows';
import { InviteSection, ReviewMeta } from './ReviewOnboardingStep';
import { AlertError } from './AlertError';

export const ReviewContractorOnboardingStep = ({
  onboardingBag,
  components,
  errors,
  setErrors,
}: {
  onboardingBag: ContractorOnboardingRenderProps['contractorOnboardingBag'];
  components: ContractorOnboardingRenderProps['components'];
  errors: {
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  };
  setErrors: (errors: {
    apiError: string;
    fieldErrors: NormalizedFieldError[];
  }) => void;
}) => {
  const { OnboardingInvite, BackButton } = components;

  const invitedStatus = onboardingBag.invitedStatus;

  return (
    <div className='onboarding-review'>
      <h2 className='title'>Basic Information</h2>
      <ReviewMeta meta={onboardingBag.meta.fields.basic_information} />
      <button
        className='back-button'
        onClick={() => onboardingBag.goTo('basic_information')}
        disabled={onboardingBag.isEmploymentReadOnly}
      >
        Edit Basic Information
      </button>
      <h2 className='title'>Contract Details</h2>
      <ReviewMeta meta={onboardingBag.meta.fields.contract_details} />
      <button
        className='back-button'
        onClick={() => onboardingBag.goTo('contract_details')}
      >
        Edit Contract Details
      </button>
      <h2 className='title'>Contract Preview</h2>
      <ReviewMeta meta={onboardingBag.meta.fields.contract_preview} />

      <button
        className='back-button'
        onClick={() => onboardingBag.goTo('contract_preview')}
      >
        Edit Contract Preview
      </button>
      <h2 className='title'>Pricing plan</h2>
      <ReviewMeta meta={onboardingBag.meta.fields.pricing_plan} />

      <button
        className='back-button'
        onClick={() => onboardingBag.goTo('pricing_plan')}
      >
        Edit Contract Preview
      </button>

      {invitedStatus === 'not_invited' && (
        <InviteSection
          title={`Ready to invite ${onboardingBag.employment?.basic_information?.name as string} to Remote?`}
          description="If you're ready to invite this employee to onboard with Remote, click the button below."
        />
      )}

      {invitedStatus === 'invited' && (
        <div className='invite-successful'>
          <h2>You’re all set!</h2>
          <p>
            {onboardingBag.employment?.basic_information?.name as string} at{' '}
            {
              onboardingBag.employment?.basic_information
                ?.personal_email as string
            }{' '}
            has been invited to Remote. We’ll let you know once they complete
            their onboarding process
          </p>
          <div>
            <button type='submit'>Go to dashboard</button>
          </div>
        </div>
      )}

      <div className='buttons-container'>
        <BackButton
          className='back-button'
          disabled={onboardingBag.isEmploymentReadOnly}
        >
          Back
        </BackButton>
        <OnboardingInvite
          className='submit-button'
          disabled={!onboardingBag.canInvite}
          render={() => {
            return 'Invite Contractor';
          }}
          onSuccess={() => {
            console.log('Contractor invited');
          }}
          onError={({ error }: { error: Error }) => {
            setErrors({
              apiError: error.message,
              fieldErrors: [],
            });
          }}
        />
        <AlertError errors={errors} />
      </div>
    </div>
  );
};
