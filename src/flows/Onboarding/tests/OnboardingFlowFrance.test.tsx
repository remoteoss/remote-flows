import { server } from '@/src/tests/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  fireEvent,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { OnboardingFlow } from '@/src/flows/Onboarding/OnboardingFlow';
import {
  basicInformationSchemaV3France,
  contractDetailsSchemaV1France,
  employmentDefaultResponseFrance,
} from '@/src/flows/Onboarding/tests/fixtures';
import { fillRadio, queryClient, TestProviders } from '@/src/tests/testHelpers';
import { OnboardingRenderProps } from '@/src/flows/Onboarding/types';
import {
  fillBasicInformation,
  generateUniqueEmploymentId,
} from '@/src/flows/Onboarding/tests/helpers';

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();

async function fillContractDetails(
  values?: Partial<{
    hasWagePortageHigherDegree: string;
    hasWagePortageYearsOfExperience: string;
    contractDurationType: string;
    annualGrossSalary: string;
  }>,
) {
  const defaultValues = {
    hasWagePortageHigherDegree: 'yes',
    hasWagePortageYearsOfExperience: 'yes',
    contractDurationType: 'indefinite', // Note: schema uses 'indefinite' or 'fixed_term', not 'yes'
    annualGrossSalary: '50000',
  };
  const newValues = {
    ...defaultValues,
    ...values,
  };
  // Wait for contract details form to be available
  await waitFor(() => {
    expect(
      screen.getByRole('radiogroup', {
        name: /Does your employee hold a higher education qualification/i,
      }),
    ).toBeInTheDocument();
  });
  // Fill has_wage_portage_higher_degree
  if (newValues.hasWagePortageHigherDegree) {
    await fillRadio(
      'Does your employee hold a higher education qualification',
      newValues.hasWagePortageHigherDegree,
    );
  }
  // Fill has_wage_portage_years_of_experience
  if (newValues.hasWagePortageYearsOfExperience) {
    await fillRadio(
      'Does the employee have at least 3 years of relevant professional experience',
      newValues.hasWagePortageYearsOfExperience,
    );
  }
  // Fill contract_duration_type
  if (newValues.contractDurationType) {
    await fillRadio('Contract duration', newValues.contractDurationType);
  }
  // Fill annual_gross_salary
  if (newValues.annualGrossSalary) {
    const salaryInput = screen.getByLabelText(/Annual gross salary/i);
    fireEvent.change(salaryInput, {
      target: { value: newValues.annualGrossSalary },
    });
  }
}

async function assertMandatoryAllowances(grossSalary: number) {
  const allowance5Percent = grossSalary * 0.05;
  const reserve10Percent = grossSalary * 0.1;
  const total = grossSalary + allowance5Percent;

  await waitFor(() => {
    expect(
      screen.getByText('Mandatory allowances', { exact: true }),
    ).toBeInTheDocument();
  });

  const allowancesSection = screen
    .getByText('Mandatory allowances', { exact: true })
    .closest('div');

  expect(allowancesSection).toHaveTextContent(
    new RegExp(`${allowance5Percent}\\s*EUR`, 'i'),
  );
  expect(allowancesSection).toHaveTextContent(
    new RegExp(`${reserve10Percent}\\s*EUR`, 'i'),
  );
  expect(allowancesSection).toHaveTextContent(
    new RegExp(`${grossSalary}\\s*EUR`, 'i'),
  );
  expect(allowancesSection).toHaveTextContent(
    new RegExp(`${total}\\s*EUR`, 'i'),
  );
}

describe('OnboardingFlow - France', () => {
  const MultiStepFormFrance = ({ components, onboardingBag }: $TSFixMe) => {
    const {
      BasicInformationStep,
      ContractDetailsStep,
      BenefitsStep,
      SubmitButton,
    } = components;

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
      case 'benefits':
        return (
          <>
            <BenefitsStep
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
        [2]: 'Benefits',
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

  it('should assert that computed values are correct in contract details step', async () => {
    render(
      <OnboardingFlow
        {...defaultProps}
        countryCode='FRA'
        skipSteps={['select_country']}
      />,
      { wrapper: TestProviders },
    );

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

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText(/Step: Contract Details/i)).toBeInTheDocument();
    });

    await fillContractDetails();

    await assertMandatoryAllowances(50000);
  });

  it('should submit contract details and reach benefits step', async () => {
    server.use(
      http.get('*/v1/employments/:id', ({ params }) => {
        const employmentId = params?.id as string;
        if (!employmentId) {
          return HttpResponse.json(
            { error: 'Employment not found' },
            { status: 404 },
          );
        }

        return HttpResponse.json(employmentDefaultResponseFrance(employmentId));
      }),
    );
    render(
      <OnboardingFlow
        {...defaultProps}
        countryCode='FRA'
        skipSteps={['select_country']}
        employmentId={generateUniqueEmploymentId()}
      />,
      { wrapper: TestProviders },
    );

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

    let nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText(/Step: Contract Details/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Annual gross salary')).toHaveValue('50000');
    });

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText(/Step: Benefits/i)).toBeInTheDocument();
    });
  });
});
