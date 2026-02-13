import {
  ContractorOnboardingRenderProps,
  NormalizedFieldError,
  useMagicLink,
} from '@remoteoss/remote-flows';
import { Button } from '@remoteoss/remote-flows/internals';
import { InfoIcon } from 'lucide-react';
import { InviteSection, ReviewMeta } from './ReviewOnboardingStep';
import { AlertError } from './AlertError';

const RemotePaymentServicesSetUp = () => {
  const magicLink = useMagicLink();

  const generateMagicLinkToPayments = async () => {
    const response = await magicLink.mutateAsync({
      path: `/dashboard/company-settings/payments`,
      user_id: import.meta.env.VITE_USER_ID,
    });

    if (response.data) {
      window.open(response.data.data.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className='flex items-center gap-4 rounded-lg border bg-card px-4 py-3'>
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
        <InfoIcon className='h-4 w-4' />
      </div>
      <div className='flex-1'>
        <h3 className='font-medium text-card-foreground'>
          Set up Remote Payments
        </h3>
        <p className='text-sm text-muted-foreground'>
          Gain access to additional payment methods and streamlined payment
          management.
        </p>
      </div>
      <Button
        className='bg-[#000000] text-white hover:bg-[#000000]/80'
        onClick={generateMagicLinkToPayments}
      >
        Set up now
      </Button>
    </div>
  );
};

// ... existing code ...

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

      {invitedStatus === 'not_invited' &&
        typeof onboardingBag.employment?.basic_information?.name ===
          'string' && (
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
          <RemotePaymentServicesSetUp />
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
