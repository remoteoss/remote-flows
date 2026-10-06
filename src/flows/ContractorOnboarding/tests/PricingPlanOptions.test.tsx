import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { mockContractorBasicInformationSchema } from '@/src/common/api/fixtures/contractors';
import { ContractorOnboardingFlow } from '@/src/flows/ContractorOnboarding/ContractorOnboarding';
import { fillBasicInformation } from '@/src/flows/ContractorOnboarding/tests/helpers';
import { mockContractorEmploymentResponse } from '@/src/flows/ContractorOnboarding/tests/fixtures';
import { ContractorOnboardingRenderProps } from '@/src/flows/ContractorOnboarding/types';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

function PricingPlanWithModal({
  contractorOnboardingBag,
  components,
}: ContractorOnboardingRenderProps) {
  const { PricingPlanStep } = components;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const subscriptionField = contractorOnboardingBag.fields.find(
    (field) => field.name === 'subscription',
  );
  const optionCount = (subscriptionField?.options as unknown[] | undefined)
    ?.length;

  return (
    <>
      <PricingPlanStep />
      <p>{`Plans offered: ${optionCount}`}</p>
      <button
        type='button'
        onClick={async () => {
          await contractorOnboardingBag.handleValidation({
            subscription: 'standard',
          });
          setIsModalOpen(true);
        }}
      >
        Compare plans
      </button>
      {isModalOpen && <div role='dialog'>Plan comparison</div>}
    </>
  );
}

function renderStep(props: ContractorOnboardingRenderProps) {
  const { contractorOnboardingBag, components } = props;
  if (contractorOnboardingBag.isLoading) return <div>Loading...</div>;
  const { BasicInformationStep, SubmitButton } = components;
  switch (contractorOnboardingBag.stepState.currentStep.name) {
    case 'basic_information':
      return (
        <>
          <h1>Step: Basic Information</h1>
          <BasicInformationStep />
          <SubmitButton>Next Step</SubmitButton>
        </>
      );
    case 'pricing_plan':
      return (
        <>
          <h1>Step: Pricing Plan</h1>
          <PricingPlanWithModal {...props} />
        </>
      );
    default:
      return null;
  }
}

describe('ContractorOnboarding pricing plan options', () => {
  beforeEach(() => {
    queryClient.clear();
    server.use(
      http.get('*/v1/countries/*/employment_basic_information*', () =>
        HttpResponse.json(mockContractorBasicInformationSchema),
      ),
      http.get('*/v1/employments/:id', () =>
        HttpResponse.json(mockContractorEmploymentResponse),
      ),
      http.post('*/v1/employments', () =>
        HttpResponse.json(mockContractorEmploymentResponse),
      ),
    );
  });

  it('keeps the plan options when the consumer re-renders after handleValidation', async () => {
    render(
      <ContractorOnboardingFlow
        countryCode='PRT'
        skipSteps={['select_country']}
        render={renderStep}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitFor(() =>
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument(),
    );
    await fillBasicInformation();
    screen.getByText(/Next Step/i).click();

    await screen.findByText(/Step: Pricing Plan/i);
    const radiosBefore = (await screen.findAllByRole('radio')).length;
    expect(radiosBefore).toBeGreaterThan(0);
    expect(
      screen.getByText(`Plans offered: ${radiosBefore}`),
    ).toBeInTheDocument();

    screen.getByText('Compare plans').click();
    await screen.findByRole('dialog');

    expect(screen.queryAllByRole('radio')).toHaveLength(radiosBefore);
    expect(
      screen.getByText(`Plans offered: ${radiosBefore}`),
    ).toBeInTheDocument();
  });
});
