import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { PropsWithChildren } from 'react';
import { beforeEach, describe, it, vi } from 'vitest';
import { server } from '@/src/tests/server';
import { render, screen, waitFor } from '@testing-library/react';

import { http, HttpResponse } from 'msw';
import { $TSFixMe } from '@remoteoss/json-schema-form';
import {
  OnboardingFlow,
  OnboardingRenderProps,
} from '@/src/flows/Onboarding/OnboardingFlow';
import {
  BasicInformationFormPayload,
  BenefitsFormPayload,
  ContractDetailsFormPayload,
} from '@/src/flows/Onboarding/types';
import {
  EmploymentCreationResponse,
  EmploymentResponse,
  SuccessResponse,
} from '@/src/client';
import {
  basicInformationSchema,
  employmentCreatedResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import { fillRadio, selectDayInCalendar } from '@/src/tests/testHelpers';
import userEvent from '@testing-library/user-event';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <FormFieldsProvider components={{}}>{children}</FormFieldsProvider>
  </QueryClientProvider>
);

const mockOnSubmitStep = vi.fn();
const mockOnSubmitForm = vi.fn();
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
    switch (onboardingBag.stepState.currentStep.name) {
      case 'basic_information':
        return (
          <>
            <BasicInformationStep
              onSubmit={(payload: BasicInformationFormPayload) =>
                console.log('payload', payload)
              }
              onSuccess={(data: EmploymentCreationResponse) =>
                console.log('data', data)
              }
              onError={(error: Error) => console.log('error', error)}
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
              onSubmit={(payload: ContractDetailsFormPayload) =>
                console.log('payload', payload)
              }
              onSuccess={(data: EmploymentResponse) =>
                console.log('data', data)
              }
              onError={(error: Error) => console.log('error', error)}
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
              onSubmit={(payload: BenefitsFormPayload) =>
                console.log('payload', payload)
              }
              onError={(error: Error) => console.log('error', error)}
              onSuccess={(data: SuccessResponse) => console.log('data', data)}
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
            <OnboardingInvite>Invite Employee</OnboardingInvite>
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
            onSubmitStep={mockOnSubmitStep}
            onSubmitForm={mockOnSubmitForm}
            onError={mockOnError}
            onSuccess={mockOnSuccess}
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
      http.post('*/v1/employments', async () => {
        return HttpResponse.json(employmentCreatedResponse);
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

    const backButton = screen.getByText(/Back/i);
    expect(backButton).toBeInTheDocument();

    backButton.click();

    await screen.findByText(/Step: Basic Information/i);

    const employeePersonalEmail = screen.getByLabelText(/Personal email/i);
    expect(employeePersonalEmail).toHaveValue('john.doe@gmail.com');
  });

  it.skip('should render the form with values when a employment is passed and we haved save information before', async () => {});

  it.skip('should render the benefits step with the values saved before', async () => {});

  it.skip("should call the invite employee endpoint when the user clicks on 'Invite Employee'", async () => {});
});
