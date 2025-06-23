import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { beforeEach, describe, it, vi } from 'vitest';
import { server } from '@/src/tests/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import { http, HttpResponse } from 'msw';
import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  OnboardingFlow,
  OnboardingRenderProps,
} from '@/src/flows/Onboarding/OnboardingFlow';
import {
  basicInformationSchema,
  contractDetailsSchema,
  benefitOffersSchema,
  employmentCreatedResponse,
  employmentUpdatedResponse,
  benefitOffersResponse,
  employmentResponse,
  benefitOffersUpdatedResponse,
  inviteResponse,
  companyResponse,
  conversionFromEURToUSD,
} from '@/src/flows/Onboarding/tests/fixtures';
import {
  assertRadioValue,
  fillRadio,
  fillSelect,
  selectDayInCalendar,
} from '@/src/tests/testHelpers';
import userEvent from '@testing-library/user-event';

const queryClient = new QueryClient();

// Helper function to generate unique employment IDs for each test
let employmentIdCounter = 0;
const generateUniqueEmploymentId = () => {
  employmentIdCounter++;
  return `test-employment-${employmentIdCounter}-${Date.now()}`;
};

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <FormFieldsProvider components={{}}>{children}</FormFieldsProvider>
  </QueryClientProvider>
);

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();

function Review({ values }: { values: Record<string, unknown> }) {
  return (
    <div className="onboarding-values">
      {Object.entries(values).map(([key, value]) => {
        if (Array.isArray(value)) {
          return (
            <pre>
              {key}: {value.join(', ')}
            </pre>
          );
        }
        if (typeof value === 'object') {
          return (
            <pre>
              {key}: {JSON.stringify(value)}
            </pre>
          );
        }
        if (typeof value === 'string' || typeof value === 'number') {
          return (
            <pre>
              {key}: {value}
            </pre>
          );
        }

        return null;
      })}
    </div>
  );
}

describe('OnboardingFlow', () => {
  const MultiStepFormWithCountry = ({
    components,
    onboardingBag,
  }: $TSFixMe) => {
    const {
      BasicInformationStep,
      ContractDetailsStep,
      BenefitsStep,
      SubmitButton,
      BackButton,
      OnboardingInvite,
      SelectCountryStep,
    } = components;

    if (onboardingBag.isLoading) {
      return <div data-testid="spinner">Loading...</div>;
    }
    switch (onboardingBag.stepState.currentStep.name) {
      case 'select_country':
        return (
          <>
            <SelectCountryStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <div className="buttons-container">
              <SubmitButton
                className="submit-button"
                disabled={onboardingBag.isSubmitting}
              >
                Continue
              </SubmitButton>
            </div>
          </>
        );
      case 'basic_information':
        return (
          <>
            <BasicInformationStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <SubmitButton disabled={onboardingBag.isSubmitting}>
              Next Step
            </SubmitButton>
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
            <BackButton>Back</BackButton>
            <SubmitButton disabled={onboardingBag.isSubmitting}>
              Next Step
            </SubmitButton>
          </>
        );

      case 'benefits':
        return (
          <>
            <BenefitsStep
              components={{}}
              onSubmit={mockOnSubmit}
              onError={mockOnError}
              onSuccess={mockOnSuccess}
            />
            <BackButton>Back</BackButton>
            <SubmitButton disabled={onboardingBag.isSubmitting}>
              Next Step
            </SubmitButton>
          </>
        );
      case 'review':
        return (
          <div className="onboarding-review">
            <h2 className="title">Basic Information</h2>
            <Review
              values={onboardingBag.stepState.values?.basic_information || {}}
            />
            <h2 className="title">Contract Details</h2>
            <Review
              values={onboardingBag.stepState.values?.contract_details || {}}
            />
            <h2 className="title">Benefits</h2>
            <Review values={onboardingBag.stepState.values?.benefits || {}} />
            <BackButton>Back</BackButton>
            <OnboardingInvite
              render={({
                status,
              }: {
                status: 'invited' | 'created_awaiting_reserve';
              }) => {
                return status === 'created_awaiting_reserve'
                  ? 'Create Reserve'
                  : 'Invite Employee';
              }}
              onSuccess={mockOnSuccess}
            />
          </div>
        );
    }

    return null;
  };

  const MultiStepFormWithoutCountry = ({
    components,
    onboardingBag,
  }: $TSFixMe) => {
    const {
      BasicInformationStep,
      ContractDetailsStep,
      BenefitsStep,
      SubmitButton,
      BackButton,
      OnboardingInvite,
    } = components;

    if (onboardingBag.isLoading) {
      return <div data-testid="spinner">Loading...</div>;
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
            <SubmitButton disabled={onboardingBag.isSubmitting}>
              Next Step
            </SubmitButton>
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
            <BackButton>Back</BackButton>
            <SubmitButton disabled={onboardingBag.isSubmitting}>
              Next Step
            </SubmitButton>
          </>
        );

      case 'benefits':
        return (
          <>
            <BenefitsStep
              components={{}}
              onSubmit={mockOnSubmit}
              onError={mockOnError}
              onSuccess={mockOnSuccess}
            />
            <BackButton>Back</BackButton>
            <SubmitButton disabled={onboardingBag.isSubmitting}>
              Next Step
            </SubmitButton>
          </>
        );
      case 'review':
        return (
          <div className="onboarding-review">
            <h2 className="title">Basic Information</h2>
            <Review
              values={onboardingBag.stepState.values?.basic_information || {}}
            />
            <h2 className="title">Contract Details</h2>
            <Review
              values={onboardingBag.stepState.values?.contract_details || {}}
            />
            <h2 className="title">Benefits</h2>
            <Review values={onboardingBag.stepState.values?.benefits || {}} />
            <BackButton>Back</BackButton>
            <OnboardingInvite
              render={() => 'Invite Employee'}
              onSuccess={mockOnSuccess}
            />
          </div>
        );
    }

    return null;
  };

  const mockRender = vi.fn(
    ({ onboardingBag, components }: OnboardingRenderProps) => {
      const currentStepIndex = onboardingBag.stepState.currentStep.index;

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
          <MultiStepFormWithCountry
            onboardingBag={onboardingBag}
            components={components}
          />
        </>
      );
    },
  );
  const defaultProps = {
    companyId: '1234',
    options: {},
    render: mockRender,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    server.use(
      http.get('*/v1/companies/:companyId', () => {
        return HttpResponse.json(companyResponse);
      }),
      http.get('*/v1/employments/:id', ({ params }) => {
        // Create a response with the actual employment ID from the request
        const employmentId = params?.id;
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              id: employmentId,
            },
          },
        });
      }),
      http.get('*/v1/countries', () => {
        return HttpResponse.json({
          data: [
            {
              code: 'PRT',
              name: 'Portugal',
            },
            {
              code: 'ESP',
              name: 'Spain',
            },
          ],
        });
      }),
      http.get('*/v1/countries/PRT/employment_basic_information*', () => {
        return HttpResponse.json(basicInformationSchema);
      }),
      http.get('*/v1/countries/PRT/contract_details*', () => {
        return HttpResponse.json(contractDetailsSchema);
      }),
      http.get('*/v1/employments/*/benefit-offers/schema', () => {
        return HttpResponse.json(benefitOffersSchema);
      }),
      http.get('*/v1/employments/*/benefit-offers', () => {
        return HttpResponse.json(benefitOffersResponse);
      }),
      http.post('*/v1/employments', () => {
        return HttpResponse.json(employmentCreatedResponse);
      }),
      http.put('*/v1/employments/*/benefit-offers', () => {
        return HttpResponse.json(benefitOffersUpdatedResponse);
      }),
      http.patch('*/v1/employments/*', async () => {
        return HttpResponse.json(employmentUpdatedResponse);
      }),
      http.post('*/v1/currency-converter', () => {
        return HttpResponse.json(conversionFromEURToUSD);
      }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockRender.mockReset();
  });

  async function fillBasicInformation(
    values?: Partial<{
      fullName: string;
      personalEmail: string;
      workEmail: string;
      jobTitle: string;
      country: string;
      jobCategory: string;
      provisionalStartDate: string;
      hasSeniorityDate: string;
    }>,
  ) {
    const defaultValues = {
      fullName: 'John Doe',
      personalEmail: 'john.doe@gmail.com',
      workEmail: 'john.doe@remote.com',
      jobTitle: 'Software Engineer',
      provisionalStartDate: '15',
      hasSeniorityDate: 'No',
    };

    const newValues = {
      ...defaultValues,
      ...values,
    };

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    });
    if (newValues?.fullName) {
      await user.type(screen.getByLabelText(/Full name/i), newValues?.fullName);
    }
    if (newValues?.personalEmail) {
      await user.type(
        screen.getByLabelText(/Personal email/i),
        newValues?.personalEmail,
      );
    }

    if (newValues?.workEmail) {
      await user.type(
        screen.getByLabelText(/Work email/i),
        newValues?.workEmail,
      );
    }

    if (newValues?.jobTitle) {
      await user.type(screen.getByLabelText(/Job title/i), newValues?.jobTitle);
    }

    if (newValues?.provisionalStartDate) {
      await selectDayInCalendar(
        newValues?.provisionalStartDate,
        'provisional_start_date',
      );
    }

    if (newValues?.hasSeniorityDate) {
      await fillRadio(
        'Does the employee have a seniority date?',
        newValues?.hasSeniorityDate,
      );
    }
  }

  async function fillCountry(country: string) {
    await screen.findByText(/Step: Select Country/i);

    await fillSelect('Country', country);

    const nextButton = screen.getByText(/Continue/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Basic Information/i);
  }

  it('should skip rendering the select country step when a countryCode is provided and skipSteps is provided', async () => {
    mockRender.mockImplementation(
      ({ onboardingBag, components }: OnboardingRenderProps) => {
        const currentStepIndex = onboardingBag.stepState.currentStep.index;

        // If we have a countryCode, use the steps without country selection
        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Contract Details',
          [2]: 'Benefits',
          [3]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
            <MultiStepFormWithoutCountry
              onboardingBag={onboardingBag}
              components={components}
            />
          </>
        );
      },
    );

    render(
      <OnboardingFlow
        employmentId={generateUniqueEmploymentId()}
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      { wrapper },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    const backButton = screen.getByText(/Back/i);
    expect(backButton).toBeInTheDocument();

    backButton.click();

    await screen.findByText(/Step: Basic Information/i);

    const employeePersonalEmail = screen.getByLabelText(/Personal email/i);
    expect(employeePersonalEmail).toHaveValue(
      employmentResponse.data.employment.personal_email,
    );
  });

  it('should select a country and advance to the next step', async () => {
    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    await fillCountry('Portugal');
  });

  it('should render the seniority_date field when the user selects yes in the radio button', async () => {
    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    await fillCountry('Portugal');

    await fillRadio('Does the employee have a seniority date?', 'Yes');

    await waitFor(() => {
      expect(screen.getByLabelText(/Seniority date/i)).toBeInTheDocument();
    });
  });

  it('should fill the first step, go to the second step and go back to the first step', async () => {
    mockRender.mockImplementation(
      ({ onboardingBag, components }: OnboardingRenderProps) => {
        const currentStepIndex = onboardingBag.stepState.currentStep.index;

        // If we have a countryCode, use the steps without country selection
        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Contract Details',
          [2]: 'Benefits',
          [3]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
            <MultiStepFormWithoutCountry
              onboardingBag={onboardingBag}
              components={components}
            />
          </>
        );
      },
    );
    render(
      <OnboardingFlow
        employmentId={generateUniqueEmploymentId()}
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      {
        wrapper,
      },
    );
    await screen.findByText(/Step: Basic Information/i);

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    const backButton = screen.getByText(/Back/i);
    expect(backButton).toBeInTheDocument();

    backButton.click();

    await screen.findByText(/Step: Basic Information/i);

    const employeePersonalEmail = screen.getByLabelText(/Personal email/i);
    expect(employeePersonalEmail).toHaveValue(
      employmentResponse.data.employment.personal_email,
    );
  });

  it('should submit the basic information step', async () => {
    mockRender.mockImplementation(
      ({ onboardingBag, components }: OnboardingRenderProps) => {
        const currentStepIndex = onboardingBag.stepState.currentStep.index;

        // If we have a countryCode, use the steps without country selection
        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Contract Details',
          [2]: 'Benefits',
          [3]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
            <MultiStepFormWithoutCountry
              onboardingBag={onboardingBag}
              components={components}
            />
          </>
        );
      },
    );
    render(
      <OnboardingFlow
        employmentId={generateUniqueEmploymentId()}
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      department: {
        id: '',
        name: '',
      },
      email: employmentResponse.data.employment.personal_email,
      has_seniority_date: 'no',
      job_title: employmentResponse.data.employment.job_title,
      manager: {
        id: '',
      },
      tax_job_category:
        employmentResponse.data.employment.basic_information.tax_job_category,
      tax_servicing_countries:
        employmentResponse.data.employment.basic_information
          .tax_servicing_countries,
      name: employmentResponse.data.employment.basic_information.name,
      provisional_start_date:
        employmentResponse.data.employment.provisional_start_date,
      work_email: employmentResponse.data.employment.work_email,
    });

    await screen.findByText(/Step: Contract Details/i);
  });

  it('should retrieve the basic information step based on an employmentId', async () => {
    render(
      <OnboardingFlow
        employmentId={generateUniqueEmploymentId()}
        {...defaultProps}
      />,
      {
        wrapper,
      },
    );

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillCountry('Portugal');

    await waitFor(() => {
      expect(screen.getByLabelText(/Personal email/i)).toHaveValue(
        employmentResponse.data.employment.personal_email,
      );
    });
  });

  it('should call the update employment endpoint when the user submits the form and the employmentId is present', async () => {
    const user = userEvent.setup();
    render(
      <OnboardingFlow
        employmentId={generateUniqueEmploymentId()}
        {...defaultProps}
      />,
      {
        wrapper,
      },
    );

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillCountry('Portugal');

    await waitFor(() => {
      expect(screen.getByLabelText(/Personal email/i)).toHaveValue(
        employmentResponse.data.employment.personal_email,
      );
    });

    // First get the input element
    const personalEmailInput = screen.getByLabelText(/Personal email/i);

    // Clear the existing value
    await user.clear(personalEmailInput);

    // Then type the new value
    await user.type(personalEmailInput, 'gabriel@gmail.com');

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      department: {
        id: undefined,
        name: undefined,
      },
      email: 'gabriel@gmail.com',
      has_seniority_date: 'no',
      job_title: employmentResponse.data.employment.job_title,
      manager: {
        id: undefined,
      },
      name: employmentResponse.data.employment.basic_information.name,
      provisional_start_date:
        employmentResponse.data.employment.provisional_start_date,
      tax_job_category:
        employmentResponse.data.employment.basic_information.tax_job_category,
      tax_servicing_countries:
        employmentResponse.data.employment.basic_information
          .tax_servicing_countries,
      work_email: employmentResponse.data.employment.work_email,
    });

    await screen.findByText(/Step: Contract Details/i);
  });

  it('should fill the contract details step and go to the benefits step', async () => {
    render(
      <OnboardingFlow
        employmentId={generateUniqueEmploymentId()}
        {...defaultProps}
      />,
      {
        wrapper,
      },
    );

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillCountry('Portugal');

    await waitFor(() => {
      expect(screen.getByLabelText(/Personal email/i)).toHaveValue(
        employmentResponse.data.employment.personal_email,
      );
    });

    let nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    await waitFor(() => {
      expect(screen.getByLabelText(/Role description/i)).toBeInTheDocument();
    });

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(3);
    });

    // Get the second call to mockOnSubmit (index 1)
    const contractDetailsSubmission = mockOnSubmit.mock.calls[2][0];

    // Assert the contract details submission
    expect(contractDetailsSubmission).toEqual({
      annual_gross_salary: 2000000,
      annual_training_hours_ack: 'acknowledged',
      available_pto: 22,
      available_pto_type: 'unlimited',
      contract_duration_type: 'indefinite',
      equity_compensation: {
        offer_equity_compensation: 'no',
      },
      experience_level:
        'Level 2 - Entry Level - Employees who perform operational tasks with an average level of complexity. They perform their functions with limited autonomy',
      has_bonus: 'no',
      has_commissions: 'no',
      has_signing_bonus: 'no',
      probation_length_days: 40,
      role_description:
        employmentResponse.data.employment.contract_details.role_description,
      salary_installments_confirmation: 'acknowledged',
      work_address: {
        is_home_address: 'yes',
      },
      work_from_home_allowance_ack: 'acknowledged',
      work_hours_per_week: 40,
      work_schedule: 'full_time',
      working_hours_exemption: 'no',
    });

    // Verify we move to the next step (Benefits)
    await screen.findByText(/Step: Benefits/i);
  });

  it('should go to the third step and check that benefits are initalized correctly', async () => {
    const employmentId = generateUniqueEmploymentId();
    server.use(
      http.get('*/v1/employments/:id', ({ params }) => {
        // Only match direct employment requests, not sub-resources
        if (params?.id?.includes('/')) return HttpResponse.error();
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              id: params?.id,
            },
          },
        });
      }),
    );
    render(<OnboardingFlow employmentId={employmentId} {...defaultProps} />, {
      wrapper,
    });

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillCountry('Portugal');

    await waitFor(() => {
      expect(screen.getByLabelText(/Personal email/i)).toHaveValue(
        employmentResponse.data.employment.personal_email,
      );
    });

    let nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    await waitFor(() => {
      expect(screen.getByLabelText(/Role description/i)).toBeInTheDocument();
    });

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await screen.findByText(/Step: Benefits/i);

    await assertRadioValue(
      '0e0293ae-eec6-4d0e-9176-51c46eed435e.value',
      'Meal Card Standard 2025',
    );

    await assertRadioValue(
      'baa1ce1d-39ea-4eec-acf0-88fc8a357f54.value',
      'Basic Health Plan 2025',
    );

    await assertRadioValue(
      '072e0edb-bfca-46e8-a449-9eed5cbaba33.value',
      'Life Insurance 50K',
    );

    await fillRadio(
      '072e0edb-bfca-46e8-a449-9eed5cbaba33.value',
      "I don't want to offer this benefit.",
    );

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(4);
    });

    const benefitsSubmission = mockOnSubmit.mock.calls[3][0];

    // Assert the contract details submission
    expect(benefitsSubmission).toEqual({
      '072e0edb-bfca-46e8-a449-9eed5cbaba33': {
        filter: '73a134db-4743-4d81-a1ec-1887f2240c5c',
        value: 'no',
      },
      '0e0293ae-eec6-4d0e-9176-51c46eed435e': {
        value: '601d28b6-efde-4b8f-b9e2-e394792fc594',
      },
      'baa1ce1d-39ea-4eec-acf0-88fc8a357f54': {
        filter: '866c0615-a810-429b-b480-3a4f6ca6157d',
        value: '45e47ffd-e1d9-4c5f-b367-ad717c30801b',
      },
    });
  });

  it("should invite the employee when the user clicks on the 'Invite Employee' button", async () => {
    const employmentId = generateUniqueEmploymentId();
    server.use(
      http.post('*/v1/employments/*/invite', () => {
        return HttpResponse.json(inviteResponse);
      }),
    );
    render(<OnboardingFlow employmentId={employmentId} {...defaultProps} />, {
      wrapper,
    });
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillCountry('Portugal');

    let nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await screen.findByText(/Step: Benefits/i);

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await screen.findByText(/Step: Review/i);

    const inviteEmployeeButton = screen.getByText(/Invite Employee/i);
    expect(inviteEmployeeButton).toBeInTheDocument();

    inviteEmployeeButton.click();

    // it should be called
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(4);
    });

    expect(mockOnSuccess.mock.calls[3][0]).toEqual(inviteResponse);
  });

  it.each(['invited', 'created_awaiting_reserve', 'created_reserve_paid'])(
    'should automatically navigate to review step when employment status is %s and display employment data',
    async (status) => {
      const employmentId = generateUniqueEmploymentId();
      server.use(
        http.get('*/v1/employments/*', () => {
          return HttpResponse.json({
            ...employmentResponse,
            data: {
              ...employmentResponse.data,
              employment: {
                ...employmentResponse.data.employment,
                id: employmentId,
                status: status,
              },
            },
          });
        }),
      );

      mockRender.mockImplementation(
        ({ onboardingBag, components }: OnboardingRenderProps) => {
          const currentStepIndex = onboardingBag.stepState.currentStep.index;

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
              <MultiStepFormWithCountry
                onboardingBag={onboardingBag}
                components={components}
              />
            </>
          );
        },
      );

      render(<OnboardingFlow employmentId={employmentId} {...defaultProps} />, {
        wrapper,
      });

      // Should automatically go to review step instead of starting from select country
      await screen.findByText(/Step: Review/i);

      // Verify basic information data is displayed in the Review component
      expect(screen.getByText('name: Gabriel')).toBeInTheDocument();

      // Verify contract details data is displayed in the Review component
      expect(
        screen.getByText('annual_gross_salary: 20000'),
      ).toBeInTheDocument();
    },
  );

  it('should not show intermediate steps when automatically navigating to review (no flickering)', async () => {
    const renderSequence: Array<{ isLoading: boolean; step?: string }> = [];
    const employmentId = generateUniqueEmploymentId();

    server.use(
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              id: employmentId,
              status: 'invited', // This should trigger auto-navigation to review
            },
          },
        });
      }),
    );

    mockRender.mockImplementation(
      ({ onboardingBag, components }: OnboardingRenderProps) => {
        const currentStepIndex = onboardingBag.stepState.currentStep.index;
        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Contract Details',
          [2]: 'Benefits',
          [3]: 'Review',
        };

        const currentStepName = steps[currentStepIndex];

        // Track every step that gets rendered
        if (!onboardingBag.isLoading && currentStepName) {
          renderSequence.push({
            isLoading: onboardingBag.isLoading,
            step: onboardingBag.isLoading ? undefined : currentStepName,
          });
        }

        // Return the current step or loading state
        if (onboardingBag.isLoading) {
          return <div data-testid="spinner">Loading...</div>;
        }

        return (
          <>
            <h1>Step: {currentStepName}</h1>
            <MultiStepFormWithoutCountry
              onboardingBag={onboardingBag}
              components={components}
            />
          </>
        );
      },
    );

    render(
      <OnboardingFlow
        employmentId={employmentId}
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      {
        wrapper,
      },
    );

    // Should go directly to review step
    await screen.findByText(/Step: Review/i);

    // Filter out just the non-loading renders to see what steps were actually shown
    const nonLoadingRenders = renderSequence
      .filter((render) => !render.isLoading)
      .map((render) => render.step);

    // Should only show Review step, never any intermediate steps
    expect(nonLoadingRenders).toEqual(['Review']);

    // Verify the sequence: should be loading states followed by Review only
    const hasIntermediateSteps = renderSequence.some(
      (render) => !render.isLoading && render.step !== 'Review',
    );

    expect(hasIntermediateSteps).toBe(false);
  });

  it('should override field labels using jsfModify options', async () => {
    const customSigningBonusLabel = 'Custom Signing Bonus Label';

    mockRender.mockImplementation(
      ({ onboardingBag, components }: OnboardingRenderProps) => {
        const currentStepIndex = onboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Contract Details',
          [2]: 'Benefits',
          [3]: 'Review',
        };

        if (onboardingBag.isLoading) {
          return <div data-testid="spinner">Loading...</div>;
        }

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
            <MultiStepFormWithoutCountry
              onboardingBag={onboardingBag}
              components={components}
            />
          </>
        );
      },
    );

    render(
      <OnboardingFlow
        employmentId={generateUniqueEmploymentId()}
        skipSteps={['select_country']}
        {...defaultProps}
        options={{
          jsfModify: {
            contract_details: {
              fields: {
                has_signing_bonus: {
                  title: customSigningBonusLabel,
                },
              },
            },
          },
        }}
      />,
      {
        wrapper,
      },
    );

    // Wait for loading to finish and form to be ready
    await screen.findByText(/Step: Basic Information/i);

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    // Verify that the custom label is displayed
    const signingBonusLabel = screen.getByText(customSigningBonusLabel);
    expect(signingBonusLabel).toBeInTheDocument();
  });

  it('should override annual gross salary field labels and conversion properties', async () => {
    const customFieldLabel = 'Test label';
    const customConversionLabel = 'Annual Gross Salary Conversion';
    const customConversionDescription =
      'This is the conversion of your annual gross salary to the desired currency.';

    mockRender.mockImplementation(
      ({ onboardingBag, components }: OnboardingRenderProps) => {
        const currentStepIndex = onboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Contract Details',
          [2]: 'Benefits',
          [3]: 'Review',
        };

        if (onboardingBag.isLoading) {
          return <div data-testid="spinner">Loading...</div>;
        }

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
            <MultiStepFormWithoutCountry
              onboardingBag={onboardingBag}
              components={components}
            />
          </>
        );
      },
    );

    render(
      <OnboardingFlow
        employmentId={generateUniqueEmploymentId()}
        skipSteps={['select_country']}
        {...defaultProps}
        options={{
          jsfModify: {
            contract_details: {
              fields: {
                annual_gross_salary: {
                  title: customFieldLabel,
                  presentation: {
                    annual_gross_salary_conversion_properties: {
                      label: customConversionLabel,
                      description: customConversionDescription,
                    },
                  },
                },
              },
            },
          },
        }}
      />,
      {
        wrapper,
      },
    );

    // Wait for loading to finish and form to be ready
    await screen.findByText(/Step: Basic Information/i);

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    // Verify the custom field label is displayed
    const annualGrossSalaryField = screen.getByLabelText(customFieldLabel);
    expect(annualGrossSalaryField).toBeInTheDocument();

    // Wait for and find the toggle button
    const toggleButton = await waitFor(() =>
      screen.getByRole('button', { name: /Show USD conversion/i }),
    );
    expect(toggleButton).toBeInTheDocument();
    await userEvent.click(toggleButton);

    // Wait for and verify the custom conversion label and description are displayed
    const conversionLabel = await waitFor(() =>
      screen.getByText(customConversionLabel),
    );
    const conversionDescription = await waitFor(() =>
      screen.getByText(customConversionDescription),
    );

    expect(conversionLabel).toBeInTheDocument();
    expect(conversionDescription).toBeInTheDocument();
  });

  it('should override the name field label in basic_information using jsfModify', async () => {
    const customNameLabel = 'Custom Full Name Label';

    mockRender.mockImplementation(
      ({ onboardingBag, components }: OnboardingRenderProps) => {
        const currentStepIndex = onboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Contract Details',
          [2]: 'Benefits',
          [3]: 'Review',
        };

        if (onboardingBag.isLoading) {
          return <div data-testid="spinner">Loading...</div>;
        }

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
            <MultiStepFormWithoutCountry
              onboardingBag={onboardingBag}
              components={components}
            />
          </>
        );
      },
    );

    render(
      <OnboardingFlow
        employmentId={generateUniqueEmploymentId()}
        skipSteps={['select_country']}
        {...defaultProps}
        options={{
          jsfModify: {
            basic_information: {
              fields: {
                name: {
                  title: customNameLabel,
                },
              },
            },
          },
        }}
      />,
      {
        wrapper,
      },
    );

    // Wait for loading to finish and form to be ready
    await screen.findByText(/Step: Basic Information/i);

    // Verify that the custom label is displayed
    const nameLabel = screen.getByLabelText(customNameLabel);
    expect(nameLabel).toBeInTheDocument();
  });

  it.skip('should call POST when submitting basic information', async () => {
    const postSpy = vi.fn();

    server.use(
      http.post('*/v1/employments', () => {
        postSpy();
        return HttpResponse.json(employmentCreatedResponse);
      }),
    );

    mockRender.mockImplementation(
      ({ onboardingBag, components }: OnboardingRenderProps) => {
        const currentStepIndex = onboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Contract Details',
          [2]: 'Benefits',
          [3]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
            <MultiStepFormWithoutCountry
              onboardingBag={onboardingBag}
              components={components}
            />
          </>
        );
      },
    );

    render(
      <OnboardingFlow
        {...defaultProps}
        countryCode="PRT"
        skipSteps={['select_country']}
      />,
      { wrapper },
    );

    await screen.findByText(/Step: Basic Information/i);

    // First submission
    await fillBasicInformation();
    const nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    // Verify POST was called
    expect(postSpy).toHaveBeenCalledTimes(1);
  });

  it('should call PATCH instead of POST when resubmitting basic information', async () => {
    const patchSpy = vi.fn();
    const employmentId = generateUniqueEmploymentId();

    server.use(
      http.patch('*/v1/employments/*', () => {
        patchSpy();
        return HttpResponse.json(employmentUpdatedResponse);
      }),
    );

    mockRender.mockImplementation(
      ({ onboardingBag, components }: OnboardingRenderProps) => {
        const currentStepIndex = onboardingBag.stepState.currentStep.index;

        const steps: Record<number, string> = {
          [0]: 'Basic Information',
          [1]: 'Contract Details',
          [2]: 'Benefits',
          [3]: 'Review',
        };

        return (
          <>
            <h1>Step: {steps[currentStepIndex]}</h1>
            <MultiStepFormWithoutCountry
              onboardingBag={onboardingBag}
              components={components}
            />
          </>
        );
      },
    );

    render(
      <OnboardingFlow
        {...defaultProps}
        employmentId={employmentId}
        skipSteps={['select_country']}
      />,
      { wrapper },
    );

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await screen.findByText(/Step: Basic Information/i);

    const nextButton = screen.getByText(/Next Step/i);
    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    // Verify PATCH was called instead of another POST
    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledTimes(1);
    });
  });

  it.each(['invited', 'created_awaiting_reserve', 'created_reserve_paid'])(
    'should automatically navigate to review step when employment status is %s and display employment data',
    async (status) => {
      const employmentId = generateUniqueEmploymentId();
      server.use(
        http.get('*/v1/employments/*', () => {
          return HttpResponse.json({
            ...employmentResponse,
            data: {
              ...employmentResponse.data,
              employment: {
                ...employmentResponse.data.employment,
                id: employmentId,
                status: status,
              },
            },
          });
        }),
      );

      mockRender.mockImplementation(
        ({ onboardingBag, components }: OnboardingRenderProps) => {
          const currentStepIndex = onboardingBag.stepState.currentStep.index;

          const steps: Record<number, string> = {
            [0]: 'Basic Information',
            [1]: 'Contract Details',
            [2]: 'Benefits',
            [3]: 'Review',
          };

          return (
            <>
              <h1>Step: {steps[currentStepIndex]}</h1>
              <MultiStepFormWithoutCountry
                onboardingBag={onboardingBag}
                components={components}
              />
            </>
          );
        },
      );

      render(
        <OnboardingFlow
          employmentId={employmentId}
          skipSteps={['select_country']}
          {...defaultProps}
        />,
        {
          wrapper,
        },
      );

      // Should automatically go to review step instead of starting from select country
      await screen.findByText(/Step: Review/i);

      // Verify basic information data is displayed in the Review component
      expect(screen.getByText('name: Gabriel')).toBeInTheDocument();

      // Verify contract details data is displayed in the Review component
      expect(
        screen.getByText('annual_gross_salary: 20000'),
      ).toBeInTheDocument();
    },
  );
});
