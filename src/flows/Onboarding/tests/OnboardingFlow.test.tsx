import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
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
import { $TSFixMe } from '@remoteoss/json-schema-form';
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
} from '@/src/flows/Onboarding/tests/fixtures';
import {
  assertRadioValue,
  fillRadio,
  selectDayInCalendar,
} from '@/src/tests/testHelpers';
import userEvent from '@testing-library/user-event';

const queryClient = new QueryClient();

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
  const MultiStepForm = ({ components, onboardingBag }: $TSFixMe) => {
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
            <OnboardingInvite onSuccess={mockOnSuccess}>
              Invite Employee
            </OnboardingInvite>
          </div>
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
        [3]: 'Review',
      };

      return (
        <>
          <h1>Step: {steps[currentStepIndex]}</h1>
          <MultiStepForm
            onboardingBag={onboardingBag}
            components={components}
          />
        </>
      );
    },
  );
  const defaultProps = {
    countryCode: 'PRT',
    options: {},
    render: mockRender,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    server.use(
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
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
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

  it('should render first step of the form', async () => {
    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Basic Information/i);
  });

  it('should render the seniority_date field when the user selects yes in the radio button', async () => {
    render(<OnboardingFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Basic Information/i);

    await fillRadio('Does the employee have a seniority date?', 'Yes');

    await waitFor(() => {
      expect(screen.getByLabelText(/Seniority date/i)).toBeInTheDocument();
    });
  });

  it('should fill the first step, go to the second step and go back to the first step', async () => {
    render(<OnboardingFlow {...defaultProps} />, { wrapper });
    await screen.findByText(/Step: Basic Information/i);

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

    const employeePersonalEmail = screen.getByLabelText(/Personal email/i);
    expect(employeePersonalEmail).toHaveValue('john.doe@gmail.com');
  });

  it('should submit the basic information step', async () => {
    render(<OnboardingFlow {...defaultProps} />, { wrapper });
    await screen.findByText(/Step: Basic Information/i);

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
      seniority_date: null,
      tax_job_category: null,
      tax_servicing_countries: null,
      work_email: 'john.doe@remote.com',
    });

    await screen.findByText(/Step: Contract Details/i);
  });

  it('should retrieve the basic information step based on an employmentId', async () => {
    server.use(
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json(employmentResponse);
      }),
    );
    render(<OnboardingFlow employmentId="1234" {...defaultProps} />, {
      wrapper,
    });

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    await screen.findByText(/Step: Basic Information/i);

    await waitFor(() => {
      expect(screen.getByLabelText(/Personal email/i)).toHaveValue(
        employmentResponse.data.employment.personal_email,
      );
    });
  });

  it('should call the update employment endpoint when the user submits the form and the employmentId is present', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json(employmentResponse);
      }),
    );
    render(<OnboardingFlow employmentId="1234" {...defaultProps} />, {
      wrapper,
    });

    await screen.findByText(/Step: Basic Information/i);

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
      seniority_date: null,
      tax_job_category:
        employmentResponse.data.employment.basic_information.tax_job_category,
      tax_servicing_countries:
        employmentResponse.data.employment.basic_information
          .tax_servicing_countries,
      work_email: employmentResponse.data.employment.work_email,
    });

    await screen.findByText(/Step: Contract Details/i);
  });

  it('should fill the second step and go to the third step', async () => {
    server.use(
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json(employmentResponse);
      }),
    );
    render(<OnboardingFlow employmentId="1234" {...defaultProps} />, {
      wrapper,
    });

    await screen.findByText(/Step: Basic Information/i);

    let nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(2);
    });

    // Get the second call to mockOnSubmit (index 1)
    const contractDetailsSubmission = mockOnSubmit.mock.calls[1][0];

    // Assert the contract details submission
    expect(contractDetailsSubmission).toEqual({
      annual_gross_salary: 2000000,
      annual_training_hours_ack: 'acknowledged',
      available_pto: 22,
      available_pto_type: 'unlimited',
      bonus_amount: null,
      bonus_details: null,
      commissions_ack: null,
      commissions_details: null,
      contract_duration: null,
      contract_duration_type: 'indefinite',
      contract_end_date: null,
      equity_compensation: {
        equity_cliff: undefined,
        equity_description: undefined,
        equity_vesting_period: undefined,
        number_of_stock_options: undefined,
        offer_equity_compensation: 'no',
      },
      experience_level:
        'Level 2 - Entry Level - Employees who perform operational tasks with an average level of complexity. They perform their functions with limited autonomy',
      has_bonus: 'no',
      has_commissions: 'no',
      has_signing_bonus: 'no',
      maximum_working_hours_regime: null,
      part_time_salary_confirmation: null,
      probation_length: null,
      probation_length_days: 40,
      role_description:
        '.asdsadksmlsdljsdkdskljdslkjsdkldskjsdljk.asdsadksmlsdljsdkdskljdslkjsdkldskjsdljk.asdsadksmlsdljsdkdskljdslkjsdkldskjsdljk.asdsadksmlsdljsdkdskljdslkjsdkldskjsdljk',
      salary_installments_confirmation: 'acknowledged',
      signing_bonus_amount: null,
      signing_bonus_clawback: null,
      work_address: {
        address: undefined,
        address_line_2: undefined,
        city: undefined,
        is_home_address: 'yes',
        postal_code: undefined,
        work_in_person_days_per_week: undefined,
      },
      work_from_home_allowance: null,
      work_from_home_allowance_ack: 'acknowledged',
      work_hours_per_week: 40,
      work_schedule: 'full_time',
      working_hours_exemption: 'no',
      working_hours_exemption_allowance: null,
    });

    // Verify we move to the next step (Benefits)
    await screen.findByText(/Step: Benefits/i);
  });

  it('should go to the third step and check that benefits are initalized correctly', async () => {
    server.use(
      http.get('*/v1/employments/:id', ({ params }) => {
        // Only match direct employment requests, not sub-resources
        if (params?.id?.includes('/')) return HttpResponse.error();
        return HttpResponse.json(employmentResponse);
      }),
    );
    render(<OnboardingFlow employmentId="1234" {...defaultProps} />, {
      wrapper,
    });

    await screen.findByText(/Step: Basic Information/i);

    let nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Contract Details/i);

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
      expect(mockOnSubmit).toHaveBeenCalledTimes(3);
    });

    const benefitsSubmission = mockOnSubmit.mock.calls[2][0];

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
    server.use(
      http.get('*/v1/employments/:id', ({ params }) => {
        // Only match direct employment requests, not sub-resources
        if (params?.id?.includes('/')) return HttpResponse.error();
        return HttpResponse.json(employmentResponse);
      }),
      http.post('*/v1/employments/*/invite', () => {
        return HttpResponse.json(inviteResponse);
      }),
    );
    render(<OnboardingFlow employmentId="1234" {...defaultProps} />, {
      wrapper,
    });

    await screen.findByText(/Step: Basic Information/i);

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
});
