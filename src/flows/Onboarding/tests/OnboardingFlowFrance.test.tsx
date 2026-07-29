import { server } from '@/src/tests/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { OnboardingFlow } from '@/src/flows/Onboarding/OnboardingFlow';
import {
  employmentCreatedResponse,
  basicInformationSchemaV3France,
  contractDetailsSchemaV1France,
} from '@/src/flows/Onboarding/tests/fixtures';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { OnboardingRenderProps } from '@/src/flows/Onboarding/types';
import { fillBasicInformation } from '@/src/flows/Onboarding/tests/helpers';

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();

describe('OnboardingFlow - France', () => {
  const MultiStepFormFrance = ({ components, onboardingBag }: $TSFixMe) => {
    const { BasicInformationStep, ContractDetailsStep, SubmitButton } =
      components;

    if (onboardingBag.isLoading) {
      return <div data-testid='spinner'>Loading...</div>;
    }

    switch (onboardingBag.stepState.currentStep.name) {
      case 'basic_information':
        return (
          <>
            <BasicInformationStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
      case 'contract_details':
        return (
          <>
            <ContractDetailsStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
    }

    return null;
  };

  const mockRender = vi.fn(
    ({ onboardingBag, components }: OnboardingRenderProps) => {
      const currentStepIndex = onboardingBag.stepState.currentStep.index;

      const steps: Record<number, string> = {
        [0]: 'Basic Information',
        [1]: 'Contract Details',
      };

      return (
        <>
          <h1>Step: {steps[currentStepIndex]}</h1>
          <MultiStepFormFrance
            onboardingBag={onboardingBag}
            components={components}
          />
        </>
      );
    },
  );

  const defaultProps = {
    companyId: '1234',
    options: {
      jsonSchemaVersion: {
        employment_basic_information: 3,
      },
    },
    render: mockRender,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRender.mockReset();
    queryClient.clear();

    server.use(
      // POST to create employment
      http.post('*/v1/employments', () => {
        return HttpResponse.json(employmentCreatedResponse);
      }),
      // GET basic information schema for France
      http.get('*/v1/countries/FRA/employment_basic_information*', () => {
        return HttpResponse.json(basicInformationSchemaV3France);
      }),
      // GET contract details schema for France
      http.get('*/v1/countries/FRA/contract_details*', () => {
        return HttpResponse.json(contractDetailsSchemaV1France);
      }),
    );
  });

  it('should submit basic information and reach contract details step', async () => {
    render(
      <OnboardingFlow
        {...defaultProps}
        countryCode='FRA'
        skipSteps={['select_country']}
      />,
      { wrapper: TestProviders },
    );

    // Wait for loading to finish
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    await screen.findByText(/Step: Basic Information/i);

    await fillBasicInformation(
      {
        ackNonEligibleJobTitles: true,
      },
      {
        skip: ['hasSeniorityDate'],
      },
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toHaveValue('John Doe');
    });

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText(/Step: Contract Details/i)).toBeInTheDocument();
    });
  });
});
