import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { beforeEach, describe, it, vi } from 'vitest';
import { server } from '@/src/tests/server';
import {
  TerminationRenderProps,
  TerminationFlow,
} from '@/src/flows/Termination/TerminationFlow';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  fillCheckbox,
  fillRadio,
  fillSelect,
  selectDayInCalendar,
} from '@/src/tests/testHelpers';
import { http, HttpResponse } from 'msw';
import { terminationResponse } from '@/src/flows/Termination/tests/fixtures';
import { getYearMonthDate } from '@/src/common/dates';
import { $TSFixMe } from '@/src/types/remoteFlows';

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

describe('TerminationFlow', () => {
  const MultiStepForm = ({
    terminationBag,
    components,
    onSubmitStep,
    onSubmitForm,
    onError,
    onSuccess,
  }: $TSFixMe) => {
    const {
      EmployeeComunicationStep,
      TerminationDetailsStep,
      PaidTimeOffStep,
      AdditionalDetailsStep,
      SubmitButton,
      Back,
      TimeOff,
    } = components;
    switch (terminationBag.stepState.currentStep.name) {
      case 'employee_communication':
        return (
          <>
            <div className="alert">
              <p>
                Please do not inform the employee of their termination until we
                review your request for legal risks. When we approve your
                request, you can inform the employee and we'll take it from
                there.
              </p>
            </div>
            <EmployeeComunicationStep
              onSubmit={(payload) =>
                onSubmitStep(payload, 'employee_communication')
              }
            />
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
      case 'termination_details':
        return (
          <>
            <TerminationDetailsStep
              onSubmit={(payload) =>
                onSubmitStep(payload, 'termination_details')
              }
            />
            <Back>Back</Back>
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
      case 'paid_time_off':
        return (
          <>
            <TimeOff
              render={({ employment, timeoff }) => {
                const username = employment?.data?.employment?.basic_information
                  ?.name as string;
                const days = timeoff?.data?.total_count || 0;

                // if days is 0 or > 1 'days' else 'day
                const daysLiteral = days > 1 || days === 0 ? 'days' : 'day';
                return (
                  <>
                    <p>
                      We have recorded {days} {daysLiteral} of paid time off for{' '}
                      {username}
                    </p>
                    <a href="#">See {username}'s timeoff breakdown</a>
                  </>
                );
              }}
            />
            <PaidTimeOffStep
              onSubmit={(payload) => onSubmitStep(payload, 'paid_time_off')}
            />
            <Back>Back</Back>
            <SubmitButton>Next Step</SubmitButton>
          </>
        );

      case 'additional_information':
        return (
          <>
            <AdditionalDetailsStep
              requesterName="ze"
              onSubmit={(payload) => onSubmitForm(payload)}
              onSuccess={onSuccess}
              onError={onError}
            />
            <Back>Back</Back>
            <SubmitButton>Send termination</SubmitButton>
          </>
        );
    }
  };

  const mockRender = vi.fn(
    ({ terminationBag, components }: TerminationRenderProps) => {
      const currentStepIndex = terminationBag.stepState.currentStep.index;

      const steps: Record<number, string> = {
        [0]: 'Employee Communication',
        [1]: 'Termination Details',
        [2]: 'Paid Time Off',
        [3]: 'Additional Information',
      };

      return (
        <>
          <h1>Step: {steps[currentStepIndex]}</h1>
          <MultiStepForm
            terminationBag={terminationBag}
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
    employmentId: '2ef4068b-11c7-4942-bb3c-70606c83688e',
    countryCode: 'PRT',
    options: {},
    render: mockRender,
  };

  let offboardingRequest: Record<string, unknown> | null = null;
  beforeEach(() => {
    vi.clearAllMocks();

    server.use(
      http.post('*/v1/offboardings', async (req) => {
        offboardingRequest = (await req.request.json()) as Record<
          string,
          unknown
        >;
        return HttpResponse.json(terminationResponse);
      }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  async function fillEmployeeCommunication(
    values?: Partial<{
      employeePersonalEmail: string;
      isRequestConfidential: string;
      isEmployeeInformed: string;
      howDidYouShareTheInformation: string;
      whenWasEmployeeInformed: string;
    }>,
  ) {
    const defaultValues = {
      employeePersonalEmail: 'ze@remote.com',
      isRequestConfidential: 'No',
      isEmployeeInformed: 'No',
      howDidYouShareTheInformation: 'Whatever text',
      whenWasEmployeeInformed: '15',
    };

    const newValues = {
      ...defaultValues,
      ...values,
    };

    const user = userEvent.setup();
    if (newValues?.isRequestConfidential) {
      await fillRadio(
        'Is this request confidential?',
        newValues?.isRequestConfidential,
      );
    }
    if (newValues?.isEmployeeInformed) {
      await fillRadio(
        'Have you informed the employee of the termination?',
        newValues?.isEmployeeInformed,
      );
    }

    if (
      newValues?.isEmployeeInformed === 'Yes' &&
      newValues?.whenWasEmployeeInformed
    ) {
      await selectDayInCalendar(
        newValues?.whenWasEmployeeInformed,
        'customer_informed_employee_date',
      );
    }

    if (
      newValues?.isEmployeeInformed === 'Yes' &&
      newValues?.howDidYouShareTheInformation
    ) {
      const howDidYouShareTheInformation = screen.getByLabelText(
        /How did you share this information?/i,
      );
      await user.type(
        howDidYouShareTheInformation,
        newValues?.howDidYouShareTheInformation,
      );
    }

    if (newValues?.employeePersonalEmail) {
      const employeePersonalEmail = screen.getByLabelText(
        /Employee's personal email/i,
      );
      await user.type(employeePersonalEmail, newValues?.employeePersonalEmail);
    }
  }

  async function fillTerminationDetails(
    values?: Partial<{
      willChangeTermination: string;
      terminationReasonDetails: string;
      terminationReason: string;
      riskAssessmentReason: string;
      proposedTerminationDate: string;
    }>,
  ) {
    const defaultValues = {
      willChangeTermination: 'No',
      terminationReasonDetails: 'whatever text',
      terminationReason: 'Gross misconduct',
      riskAssessmentReason: 'Currently on or recently returned from sick leave',
      proposedTerminationDate: '15',
    };

    const newValues = {
      ...defaultValues,
      ...values,
    };
    const user = userEvent.setup();
    if (newValues?.willChangeTermination) {
      await fillRadio(
        'Do you consider it is likely that the employee will challenge their termination?',
        newValues?.willChangeTermination,
      );
    }

    if (newValues?.terminationReasonDetails) {
      const terminationReasonDetails = screen.getByLabelText(
        /Termination reason details/i,
      );
      await user.type(
        terminationReasonDetails,
        newValues?.terminationReasonDetails,
      );
    }

    if (newValues?.terminationReason) {
      await fillSelect('Termination reason', newValues?.terminationReason);
    }

    if (newValues?.riskAssessmentReason) {
      await fillCheckbox(newValues?.riskAssessmentReason);
    }
    if (newValues?.proposedTerminationDate) {
      await selectDayInCalendar(
        newValues?.proposedTerminationDate,
        'proposed_termination_date',
      );
    }
  }

  async function fillPTO(values?: Partial<{ agreePTO: string }>) {
    const defaultValues = {
      agreePTO: 'Yes',
    };

    const newValues = {
      ...defaultValues,
      ...values,
    };
    if (newValues?.agreePTO) {
      await fillRadio(
        'Are these paid time off records correct?',
        newValues?.agreePTO,
      );
    }
  }

  async function fillAdditionalDetails(
    values?: Partial<{
      ackowledgeTermination: boolean;
    }>,
  ) {
    const defaultValues = {
      ackowledgeTermination: true,
    };
    const newValues = {
      ...defaultValues,
      ...values,
    };
    if (newValues?.ackowledgeTermination) {
      await fillCheckbox(
        'I, ze have read and agree to the procedures as defined in the termination form.',
      );
    }
  }

  it('should render first step of the form', async () => {
    render(<TerminationFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Employee Communication/i);
  });

  it('should render the conditional fields of the radio after only touching the radio field', async () => {
    render(<TerminationFlow {...defaultProps} />, { wrapper });
    await screen.findByText(/Step: Employee Communication/i);

    await fillRadio(
      'Have you informed the employee of the termination?',
      'Yes',
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText(/How did you share this information?/i),
      ).toBeInTheDocument();
    });
  });

  it('should render will_challenge_termination details field immediately after selecting will_challenge_termination', async () => {
    render(<TerminationFlow {...defaultProps} />, { wrapper });
    await screen.findByText(/Step: Employee Communication/i);
    await fillEmployeeCommunication();
    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();
    await screen.findByText(/Step: Termination Details/i);

    await fillRadio(
      'Do you consider it is likely that the employee will challenge their termination?',
      'Yes',
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText(
          /Please explain how the employee will challenge their termination/i,
        ),
      ).toBeInTheDocument();
    });
  });

  // this test needs to be before the multi step, something strange is happening when executed in parallel with the next one
  it('should fill the first step and go back to the previous step', async () => {
    render(<TerminationFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Employee Communication/i);

    await fillEmployeeCommunication({
      isEmployeeInformed: 'Yes',
    });

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Termination Details/i);

    const backButton = screen.getByText(/Back/i);
    expect(backButton).toBeInTheDocument();

    backButton.click();

    await screen.findByText(/Step: Employee Communication/i);

    const employeePersonalEmail = screen.getByLabelText(
      /Employee's personal email/i,
    );
    expect(employeePersonalEmail).toHaveValue('ze@remote.com');

    const howDidYouShareTheInformation = screen.getByLabelText(
      /How did you share this information?/i,
    );

    expect(howDidYouShareTheInformation).toHaveValue('Whatever text');
  });

  it('should submit the termination flow', async () => {
    const currentDate = getYearMonthDate(new Date());
    const dynamicDate = `${currentDate.year}-${currentDate.month}-15`;
    render(<TerminationFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Employee Communication/i);

    await fillEmployeeCommunication({
      isEmployeeInformed: 'Yes',
    });

    let nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmitStep).toHaveBeenCalledTimes(1);
    });
    expect(mockOnSubmitStep).toHaveBeenCalledWith(
      {
        acknowledge_termination_procedure: false,
        confidential: 'no',
        customer_informed_employee: 'yes',
        customer_informed_employee_date: dynamicDate,
        customer_informed_employee_description: 'Whatever text',
        personal_email: 'ze@remote.com',
        risk_assessment_reasons: [],
        termination_reason_files: [],
      },
      'employee_communication',
    );
    await screen.findByText(/Step: Termination Details/i);

    await fillTerminationDetails();

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmitStep).toHaveBeenCalledTimes(2);
    });
    expect(mockOnSubmitStep.mock.calls[1]).toEqual([
      {
        acknowledge_termination_procedure: false,
        confidential: 'no',
        customer_informed_employee: 'yes',
        customer_informed_employee_date: dynamicDate,
        customer_informed_employee_description: 'Whatever text',
        personal_email: 'ze@remote.com',
        proposed_termination_date: dynamicDate,
        reason_description: 'whatever text',
        risk_assessment_reasons: ['sick_leave'],
        termination_reason: 'gross_misconduct',
        termination_reason_files: [],
        will_challenge_termination: 'no',
      },
      'termination_details',
    ]);

    await screen.findByText(/Step: Paid Time Off/i);

    await fillPTO();

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmitStep).toHaveBeenCalledTimes(3);
    });

    expect(mockOnSubmitStep.mock.calls[2]).toEqual([
      {
        acknowledge_termination_procedure: false,
        agrees_to_pto_amount: 'yes',
        confidential: 'no',
        customer_informed_employee: 'yes',
        customer_informed_employee_date: dynamicDate,
        customer_informed_employee_description: 'Whatever text',
        personal_email: 'ze@remote.com',
        proposed_termination_date: dynamicDate,
        reason_description: 'whatever text',
        risk_assessment_reasons: ['sick_leave'],
        termination_reason: 'gross_misconduct',
        termination_reason_files: [],
        will_challenge_termination: 'no',
      },
      'paid_time_off',
    ]);

    await screen.findByText(/Step: Additional Information/i);

    await fillAdditionalDetails();

    const submitButton = screen.getByText(/Send termination/i);
    expect(submitButton).toBeInTheDocument();
    submitButton.click();
    await waitFor(() => {
      expect(mockOnSubmitForm).toHaveBeenCalledTimes(1);
    });

    expect(mockOnSubmitForm).toHaveBeenCalledWith({
      acknowledge_termination_procedure: true,
      agrees_to_pto_amount: 'yes',
      confidential: 'no',
      customer_informed_employee: 'yes',
      customer_informed_employee_date: dynamicDate,
      customer_informed_employee_description: 'Whatever text',
      personal_email: 'ze@remote.com',
      proposed_termination_date: dynamicDate,
      reason_description: 'whatever text',
      risk_assessment_reasons: ['sick_leave'],
      termination_reason: 'gross_misconduct',
      termination_reason_files: [],
      will_challenge_termination: 'no',
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(terminationResponse);

    await waitFor(() => {
      expect(offboardingRequest).not.toBeNull();
    });

    expect(offboardingRequest).toEqual({
      employment_id: '2ef4068b-11c7-4942-bb3c-70606c83688e',
      termination_details: {
        acknowledge_termination_procedure: true,
        agrees_to_pto_amount: true,
        confidential: false,
        customer_informed_employee: true,
        employee_awareness: {
          date: dynamicDate,
          note: 'Whatever text',
        },
        personal_email: 'ze@remote.com',
        proposed_termination_date: dynamicDate,
        reason_description: 'whatever text',
        risk_assessment_reasons: ['sick_leave'],
        termination_reason: 'gross_misconduct',
        termination_reason_files: [],
        will_challenge_termination: false,
      },
      type: 'termination',
    });
  });

  it("should trigger the 'onError' callback when the request fails", async () => {
    server.use(
      http.post('*/v1/offboardings', async () => {
        return HttpResponse.json(
          {
            error: 'Something went wrong',
          },
          { status: 500 },
        );
      }),
    );
    render(<TerminationFlow {...defaultProps} />, { wrapper });
    await screen.findByText(/Step: Employee Communication/i);
    await fillEmployeeCommunication();
    let nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await screen.findByText(/Step: Termination Details/i);

    await fillTerminationDetails();

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Paid Time Off/i);

    await fillPTO();

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Additional Information/i);

    await fillAdditionalDetails();

    const submitButton = screen.getByText(/Send termination/i);
    expect(submitButton).toBeInTheDocument();
    submitButton.click();

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledTimes(1);
    });
  });

  it('should click next step without filling the form and show error', async () => {
    render(<TerminationFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Employee Communication/i);

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    fillEmployeeCommunication({
      employeePersonalEmail: 'ze@remote.com',
    });

    nextButton.click();

    const errors = await screen.findAllByText(/Required field/i);

    expect(errors.length).toBeGreaterThan(0);
  });
});
