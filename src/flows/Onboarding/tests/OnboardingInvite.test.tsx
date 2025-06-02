import {
  OnboardingFlow,
  OnboardingRenderProps,
} from '@/src/flows/Onboarding/OnboardingFlow';
import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <FormFieldsProvider components={{}}>{children}</FormFieldsProvider>
  </QueryClientProvider>
);

const mockRender = vi.fn(
  ({ onboardingBag, components }: OnboardingRenderProps) => {
    const currentStepIndex = onboardingBag.stepState.currentStep.index;

    const { OnboardingInvite } = components;

    const steps: Record<number, string> = {
      [0]: 'Select Country',
      [1]: 'Basic Information',
      [2]: 'Contract Details',
      [3]: 'Benefits',
      [4]: 'Review',
    };

    return (
      <>
        <h1>Step: {steps[currentStepIndex]}</h1>
        <OnboardingInvite />
      </>
    );
  },
);

const defaultProps = {
  companyId: '1234',
  options: {},
  render: mockRender,
};

describe('OnboardingInvite', () => {
  it('should render the OnboardingInvite component', async () => {
    // This is a placeholder test to ensure the component renders without crashing.
    // You can add more specific tests as needed.
    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    await screen.findByText('Select Country');
  });

  // Add more tests here as needed
});
