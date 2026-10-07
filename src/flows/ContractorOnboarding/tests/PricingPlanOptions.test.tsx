import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { mockContractorBasicInformationSchema } from '@/src/common/api/fixtures/contractors';
import { mockContractorSubscriptionResponse } from '@/src/common/api/fixtures/contractors-subscriptions';
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
          <SubmitButton>Next Step</SubmitButton>
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

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('blocks submitting a preselected plan that excludeProducts hides', async () => {
    const corSubscriptionSpy = vi.fn();
    server.use(
      http.get('*/v1/employments/:id', () =>
        HttpResponse.json({
          ...mockContractorEmploymentResponse,
          data: {
            ...mockContractorEmploymentResponse.data,
            employment: {
              ...mockContractorEmploymentResponse.data.employment,
              contractor_type: 'cor',
            },
          },
        }),
      ),
      http.post(
        '*/v1/contractors/employments/*/contractor-cor-subscription',
        () => {
          corSubscriptionSpy();
          return HttpResponse.json({});
        },
      ),
    );

    render(
      <ContractorOnboardingFlow
        countryCode='PRT'
        skipSteps={['select_country']}
        options={{ excludeProducts: ['cor'] }}
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
    await screen.findAllByRole('radio');
    expect(
      screen.queryByRole('radio', { name: /^Contractor of Record$/ }),
    ).not.toBeInTheDocument();

    screen.getByText(/Next Step/i).click();

    expect(await screen.findByText(/is not valid/i)).toBeInTheDocument();
    expect(screen.getByText(/Step: Pricing Plan/i)).toBeInTheDocument();
    expect(corSubscriptionSpy).not.toHaveBeenCalled();
  });

  it.each([
    ['without excludeProducts', undefined],
    ['with an inline excludeProducts', () => ['eor' as const]],
  ])('settles the pricing plan step %s', async (_, excludeProducts) => {
    const missingDescriptionLog = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    server.use(
      http.get('*/v1/contractors/employments/*/contractor-subscriptions', () =>
        HttpResponse.json({
          ...mockContractorSubscriptionResponse,
          data: mockContractorSubscriptionResponse.data.map((subscription) => ({
            ...subscription,
            product: { ...subscription.product, description: undefined },
          })),
        }),
      ),
    );

    function Consumer() {
      const [, setTick] = useState(0);
      return (
        <>
          <button type='button' onClick={() => setTick((t) => t + 1)}>
            Re-render
          </button>
          <ContractorOnboardingFlow
            countryCode='PRT'
            skipSteps={['select_country']}
            options={
              excludeProducts
                ? { excludeProducts: excludeProducts() }
                : undefined
            }
            render={renderStep}
          />
        </>
      );
    }

    render(<Consumer />, { wrapper: TestProviders });

    await screen.findByText(/Step: Basic Information/i);
    await waitFor(() =>
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument(),
    );
    await fillBasicInformation();
    screen.getByText(/Next Step/i).click();

    await screen.findByText(/Step: Pricing Plan/i);
    await screen.findAllByRole('radio');
    screen.getByText('Re-render').click();
    screen.getByText('Re-render').click();
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(
      missingDescriptionLog.mock.calls.filter(([message]) =>
        String(message).startsWith('[Data Integrity]'),
      ),
    ).toHaveLength(mockContractorSubscriptionResponse.data.length);
  });
});
