import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
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
  companyResponse,
  conversionFromEURToUSD,
} from '@/src/flows/Onboarding/tests/fixtures';
import {
  fillRadio,
  fillSelect,
  selectDayInCalendar,
} from '@/src/tests/testHelpers';
import { NormalizedFieldError } from '@/src/lib/mutations';
import { fireEvent } from '@testing-library/react';

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

    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    });

    if (newValues?.fullName) {
      fireEvent.change(screen.getByLabelText(/Full name/i), {
        target: { value: newValues?.fullName },
      });
    }

    if (newValues?.personalEmail) {
      fireEvent.change(screen.getByLabelText(/Personal email/i), {
        target: { value: newValues?.personalEmail },
      });
    }

    if (newValues?.workEmail) {
      fireEvent.change(screen.getByLabelText(/Work email/i), {
        target: { value: newValues?.workEmail },
      });
    }

    if (newValues?.jobTitle) {
      fireEvent.change(screen.getByLabelText(/Job title/i), {
        target: { value: newValues?.jobTitle },
      });
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

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillSelect('Country', country);

    const nextButton = screen.getByText(/Continue/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Basic Information/i);
  }

  it('should skip rendering the select country step when skip steps is provided', async () => {
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
      <OnboardingFlow skipSteps={['select_country']} {...defaultProps} />,
      { wrapper },
    );

    await screen.findByText(/Step: Basic Information/i);
  });

  it('should select a country and advance to the next step', async () => {
    render(<OnboardingFlow {...defaultProps} />, { wrapper });
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
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
        countryCode="PRT"
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      {
        wrapper,
      },
    );
    await screen.findByText(/Step: Basic Information/i);

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    await fillBasicInformation();

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    const backButton = screen.getByText(/Back/i);
    expect(backButton).toBeInTheDocument();

    backButton.click();

    await screen.findByText(/Step: Basic Information/i);

    await waitFor(() => {
      expect(screen.getByLabelText(/Personal email/i)).toHaveValue(
        'john.doe@gmail.com',
      );
    });
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
        countryCode="PRT"
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      {
        wrapper,
      },
    );

    await fillBasicInformation();

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
      email: 'john.doe@gmail.com',
      has_seniority_date: 'no',
      job_title: 'Software Engineer',
      manager: {
        id: undefined,
      },
      name: 'John Doe',
      provisional_start_date: '2025-05-15',
      work_email: 'john.doe@remote.com',
    });

    await screen.findByText(/Step: Contract Details/i);
  });

  it('should retrieve the contract details step based on an employmentId', async () => {
    server.use(
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
              contract_details: null,
            },
          },
        });
      }),
    );
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

    await screen.findByText(/Step: Contract Details/i);
  });

  it('should call the update employment endpoint when the user submits the form and the employmentId is present', async () => {
    server.use(
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
              contract_details: null,
            },
          },
        });
      }),
    );
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
    await screen.findByText(/Step: Contract Details/i);

    const backButton = screen.getByText(/Back/i);
    expect(backButton).toBeInTheDocument();
    backButton.click();

    await waitFor(() => {
      expect(screen.getByLabelText(/Personal email/i)).toHaveValue(
        employmentResponse.data.employment.personal_email,
      );
    });

    // First get the input element
    const personalEmailInput = screen.getByLabelText(/Personal email/i);

    // Clear the existing value
    fireEvent.change(personalEmailInput, { target: { value: '' } });
    fireEvent.change(personalEmailInput, {
      target: { value: 'gabriel@gmail.com' },
    });

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
      emails: 'gabriel@gmail.com',
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
    server.use(
      http.get('*/v1/employments/*/benefit-offers', () => {
        return HttpResponse.json({ data: [] });
      }),
    );
    render(
      <OnboardingFlow
        employmentId={generateUniqueEmploymentId()}
        {...defaultProps}
      />,
      {
        wrapper,
      },
    );

    await screen.findByText(/Step: Benefits/i);

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    const backButton = screen.getByText(/Back/i);
    expect(backButton).toBeInTheDocument();

    backButton.click();

    await screen.findByText(/Step: Contract Details/i);

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
    // Assert the contract details submission
    expect(mockOnSubmit).toHaveBeenCalledWith({
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

  it('should verify that the benefits are submitted correctly', async () => {
    server.use(
      http.get('*/v1/employments/*/benefit-offers', () => {
        // Return empty benefits so we can fill them
        return HttpResponse.json({ data: [] });
      }),
    );
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
    await screen.findByText(/Step: Benefits/i);

    // Fill all three benefits
    await fillRadio(
      '0e0293ae-eec6-4d0e-9176-51c46eed435e.value',
      'Meal Card Standard 2025',
    );

    await fillRadio(
      'baa1ce1d-39ea-4eec-acf0-88fc8a357f54.value',
      'Basic Health Plan 2025',
    );

    await fillRadio(
      '072e0edb-bfca-46e8-a449-9eed5cbaba33.value',
      "I don't want to offer this benefit.",
    );

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      '0e0293ae-eec6-4d0e-9176-51c46eed435e': {
        value: '601d28b6-efde-4b8f-b9e2-e394792fc594',
      },
      'baa1ce1d-39ea-4eec-acf0-88fc8a357f54': {
        filter: '866c0615-a810-429b-b480-3a4f6ca6157d',
        value: '45e47ffd-e1d9-4c5f-b367-ad717c30801b',
      },
      '072e0edb-bfca-46e8-a449-9eed5cbaba33': {
        filter: '73a134db-4743-4d81-a1ec-1887f2240c5c',
        value: 'no',
      },
    });

    // Optionally verify we moved to the next step
    await screen.findByText(/Step: Review/i);
  });

  it('should call POST when submitting basic information', async () => {
    const postSpy = vi.fn();

    server.use(
      http.get('*/v1/employments/:id', () => {
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              basic_information: null,
              contract_details: null,
            },
          },
        });
      }),
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
        employmentId={generateUniqueEmploymentId()}
        skipSteps={['select_country']}
      />,
      { wrapper },
    );

    await screen.findByText(/Step: Basic Information/i);
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

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
        http.get(`*/v1/employments/${employmentId}`, () => {
          return HttpResponse.json({
            ...employmentResponse,
            data: {
              ...employmentResponse.data,
              employment: {
                ...employmentResponse.data.employment,
                employmentId: employmentId,
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

  it.each(['invited', 'created_awaiting_reserve', 'created_reserve_paid'])(
    'should automatically navigate to review step when employment status is %s and display employment data',
    async (status) => {
      const employmentId = generateUniqueEmploymentId();
      server.use(
        http.get(`*/v1/employments/${employmentId}`, () => {
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

      await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

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
    const employmentId = generateUniqueEmploymentId(); // Use a fixed ID for consistency
    server.use(
      http.get(`*/v1/employments/${employmentId}`, () => {
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              employmentId: employmentId,
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
    const uniqueEmploymentId = generateUniqueEmploymentId();
    server.use(
      http.get(`*/v1/employments/${uniqueEmploymentId}`, () => {
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              id: uniqueEmploymentId,
              contract_details: null,
              status: 'created', // Ensure it's not a readonly status
            },
          },
        });
      }),
    );
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
        employmentId={uniqueEmploymentId}
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

    await screen.findByText(/Step: Contract Details/i);

    // Verify that the custom label is displayed
    const signingBonusLabel = screen.getByText(customSigningBonusLabel);
    expect(signingBonusLabel).toBeInTheDocument();
  });

  it('should override annual gross salary field labels and conversion properties', async () => {
    const uniqueEmploymentId = generateUniqueEmploymentId();
    server.use(
      http.get(`*/v1/employments/${uniqueEmploymentId}`, () => {
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              id: uniqueEmploymentId,
              contract_details: null,
              status: 'created', // Ensure it's not a readonly status
            },
          },
        });
      }),
    );
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
        employmentId={uniqueEmploymentId}
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

    await screen.findByText(/Step: Contract Details/i);

    // Verify the custom field label is displayed
    const annualGrossSalaryField = screen.getByLabelText(customFieldLabel);
    expect(annualGrossSalaryField).toBeInTheDocument();

    // Wait for and find the toggle button
    const toggleButton = await waitFor(() =>
      screen.getByRole('button', { name: /Show USD conversion/i }),
    );
    expect(toggleButton).toBeInTheDocument();
    fireEvent.click(toggleButton);

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
    const uniqueEmploymentId = generateUniqueEmploymentId();
    server.use(
      http.get(`*/v1/employments/${uniqueEmploymentId}`, () => {
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              id: uniqueEmploymentId,
              contract_details: null,
              basic_information: null,
              status: 'created', // Ensure it's not a readonly status
            },
          },
        });
      }),
    );
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
        employmentId={uniqueEmploymentId}
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

  it('should handle 422 validation errors with field errors when creating employment', async () => {
    // Mock the POST endpoint to return a 422 error with field errors
    server.use(
      http.post('*/v1/employments', () => {
        return HttpResponse.json(
          {
            errors: {
              provisional_start_date: ['cannot be in a holiday'],
              email: ['has already been taken'],
            },
          },
          { status: 422 },
        );
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
        countryCode="PRT"
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      { wrapper },
    );

    await screen.findByText(/Step: Basic Information/i);

    // Fill in the form with data that will trigger the 422 error
    await fillBasicInformation({
      fullName: 'John Doe',
      personalEmail: 'existing@email.com', // This will trigger "has already been taken"
      workEmail: 'john.doe@remote.com',
      jobTitle: 'Software Engineer',
      provisionalStartDate: '25', // This will trigger "cannot be in a holiday"
      hasSeniorityDate: 'No',
    });

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    // Wait for the error to be called
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledTimes(1);
    });

    // Get the error call arguments
    const errorCall = mockOnError.mock.calls[0][0];

    // Verify the error structure
    expect(errorCall.error).toBeInstanceOf(Error);
    expect(errorCall.rawError).toEqual({
      errors: {
        provisional_start_date: ['cannot be in a holiday'],
        email: ['has already been taken'],
      },
    });
    expect(errorCall.fieldErrors.length).toBe(2);

    // Verify the field errors are normalized with user-friendly labels
    const provisionalStartDateError = errorCall.fieldErrors.find(
      (error: NormalizedFieldError) => error.field === 'provisional_start_date',
    );
    const personalEmailError = errorCall.fieldErrors.find(
      (error: NormalizedFieldError) => error.field === 'email',
    );

    expect(provisionalStartDateError.messages).toEqual([
      'cannot be in a holiday',
    ]);
    expect(provisionalStartDateError.userFriendlyLabel).toBe(
      'Provisional start date',
    );

    expect(personalEmailError).toBeDefined();
    expect(personalEmailError.messages).toEqual(['has already been taken']);
    expect(personalEmailError.userFriendlyLabel).toBe('Personal email');

    // Verify we stay on the same step (don't advance)
    await screen.findByText(/Step: Basic Information/i);
  });

  it('should handle 422 validation errors with field errors when updating employment in contract details step', async () => {
    const uniqueEmploymentId = generateUniqueEmploymentId();

    // Mock the PATCH endpoint to return success first, then 422 error
    server.use(
      http.get('*/v1/employments/*/benefit-offers', () => {
        return HttpResponse.json({ data: [] });
      }),
      http.get(`*/v1/employments/${uniqueEmploymentId}`, () => {
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              id: uniqueEmploymentId,
              status: 'created', // Ensure it's not a readonly status
            },
          },
        });
      }),
      http.patch('*/v1/employments/*', () => {
        return HttpResponse.json(
          {
            errors: {
              annual_gross_salary: ['must be greater than 0'],
            },
          },
          { status: 422 },
        );
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
        employmentId={uniqueEmploymentId}
        skipSteps={['select_country']}
        {...defaultProps}
        options={{
          jsfModify: {
            contract_details: {
              fields: {
                annual_gross_salary: {
                  title: 'Test Label',
                },
              },
            },
          },
        }}
      />,
      { wrapper },
    );

    // Wait for the basic information step to load
    await screen.findByText(/Step: Benefits/i);

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    // Navigate to contract details step
    const backButton = screen.getByText(/Back/i);
    expect(backButton).toBeInTheDocument();
    backButton.click();

    // Wait for contract details step to load
    await screen.findByText(/Step: Contract Details/i);

    // Wait for the form to be populated with existing data
    await waitFor(() => {
      expect(screen.getByLabelText(/Role description/i)).toBeInTheDocument();
    });

    // Modify annual gross salary to trigger the error
    const annualGrossSalaryInput = screen.getByLabelText(/Test Label/i);
    fireEvent.change(annualGrossSalaryInput, { target: { value: '' } });
    fireEvent.change(annualGrossSalaryInput, { target: { value: '100000' } });

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    // Wait for the error to be called
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledTimes(1);
    });

    // Get the error call arguments
    const errorCall = mockOnError.mock.calls[0][0];

    // Verify the error structure
    expect(errorCall.error).toBeInstanceOf(Error);
    expect(errorCall.rawError).toEqual({
      errors: {
        annual_gross_salary: ['must be greater than 0'],
      },
    });

    // Verify the field errors are normalized with user-friendly labels
    const annualGrossSalaryError = errorCall.fieldErrors.find(
      (error: NormalizedFieldError) => error.field === 'annual_gross_salary',
    );

    expect(annualGrossSalaryError).toBeDefined();
    expect(annualGrossSalaryError.messages).toEqual(['must be greater than 0']);
    expect(annualGrossSalaryError.userFriendlyLabel).toBe('Test Label');

    // Verify we stay on the same step (don't advance)
    await screen.findByText(/Step: Contract Details/i);
  });

  it('should handle 422 validation errors with field errors when updating benefits', async () => {
    const uniqueEmploymentId = generateUniqueEmploymentId();

    // Mock the employment endpoint to return data with a non-readonly status
    server.use(
      http.get('*/v1/employments/*/benefit-offers', () => {
        return HttpResponse.json({ data: [] });
      }),
      http.get(`*/v1/employments/${uniqueEmploymentId}`, () => {
        return HttpResponse.json({
          ...employmentResponse,
          data: {
            ...employmentResponse.data,
            employment: {
              ...employmentResponse.data.employment,
              id: uniqueEmploymentId,
              status: 'created', // Ensure it's not a readonly status
            },
          },
        });
      }),
      // Mock the PUT endpoint to return success first, then 422 error
      http.put('*/v1/employments/*/benefit-offers', () => {
        return HttpResponse.json(
          {
            errors: {
              '0e0293ae-eec6-4d0e-9176-51c46eed435e': [
                'Invalid meal benefit selection',
              ],
              'baa1ce1d-39ea-4eec-acf0-88fc8a357f54': [
                'Health insurance not available for this region',
              ],
            },
          },
          { status: 422 },
        );
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
        employmentId={uniqueEmploymentId}
        skipSteps={['select_country']}
        {...defaultProps}
      />,
      { wrapper },
    );

    // Wait for the basic information step to load
    await screen.findByText(/Step: Benefits/i);

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

    // Fill all three benefits to make the form valid
    await fillRadio(
      '0e0293ae-eec6-4d0e-9176-51c46eed435e.value',
      'Meal Card Standard 2025',
    );

    await fillRadio(
      'baa1ce1d-39ea-4eec-acf0-88fc8a357f54.value',
      'Basic Health Plan 2025',
    );

    await fillRadio(
      '072e0edb-bfca-46e8-a449-9eed5cbaba33.value',
      "I don't want to offer this benefit.",
    );

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    // Wait for the error to be called
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledTimes(1);
    });

    // Get the error call arguments
    const errorCall = mockOnError.mock.calls[0][0];

    // Verify the error structure
    expect(errorCall.error).toBeInstanceOf(Error);
    expect(errorCall.rawError).toEqual({
      errors: {
        '0e0293ae-eec6-4d0e-9176-51c46eed435e': [
          'Invalid meal benefit selection',
        ],
        'baa1ce1d-39ea-4eec-acf0-88fc8a357f54': [
          'Health insurance not available for this region',
        ],
      },
    });

    // Verify the field errors are normalized with user-friendly labels
    const mealBenefitError = errorCall.fieldErrors.find(
      (error: NormalizedFieldError) =>
        error.field === '0e0293ae-eec6-4d0e-9176-51c46eed435e',
    );
    const healthInsuranceError = errorCall.fieldErrors.find(
      (error: NormalizedFieldError) =>
        error.field === 'baa1ce1d-39ea-4eec-acf0-88fc8a357f54',
    );

    expect(mealBenefitError).toBeDefined();
    expect(mealBenefitError.messages).toEqual([
      'Invalid meal benefit selection',
    ]);
    expect(mealBenefitError.userFriendlyLabel).toBe('Meal Benefit');

    expect(healthInsuranceError).toBeDefined();
    expect(healthInsuranceError.messages).toEqual([
      'Health insurance not available for this region',
    ]);
    expect(healthInsuranceError.userFriendlyLabel).toBe(
      'Health Insurance 2025',
    );

    // Verify we stay on the same step (don't advance)
    await screen.findByText(/Step: Benefits/i);
  });
});
