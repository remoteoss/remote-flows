import { ContractorOnboardingRenderProps } from '@remoteoss/remote-flows';
import { ReviewMeta } from './ReviewOnboardingStep';

export const ReviewContractorOnboardingStep = ({
  onboardingBag,
}: {
  onboardingBag: ContractorOnboardingRenderProps['contractorOnboardingBag'];
}) => {
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
    </div>
  );
};
