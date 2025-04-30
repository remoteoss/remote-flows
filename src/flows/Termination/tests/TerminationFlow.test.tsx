import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { PropsWithChildren } from 'react';
import { beforeEach, describe, it, vi } from 'vitest';
import { server } from '@/src/tests/server';
import {
  RenderProps,
  TerminationFlow,
} from '@/src/flows/Termination/TerminationFlow';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  fillCheckbox,
  fillRadio,
  fillSelect,
  selectDayInCalendar,
} from '@/src/common/testHelpers';
import { http, HttpResponse } from 'msw';
import { terminationResponse } from '@/src/flows/Termination/tests/fixtures';
import { getYearMonthDate } from '@/src/common/dates';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <FormFieldsProvider components={{}}>{children}</FormFieldsProvider>
  </QueryClientProvider>
);

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();

describe('TerminationFlow', () => {
  const mockRender = vi.fn(({ terminationBag, components }: RenderProps) => {
    const { Form, Back, SubmitButton } = components;

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
        <Form
          username="ze"
          onSubmit={mockOnSubmit}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
        {currentStepIndex > 0 && <Back>Back</Back>}
        {currentStepIndex <= terminationBag.stepState.totalSteps - 1 && (
          <SubmitButton>
            {currentStepIndex < terminationBag.stepState.totalSteps - 1
              ? 'Next Step'
              : 'Send termination'}
          </SubmitButton>
        )}
      </>
    );
  });
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
      await selectDayInCalendar(newValues?.whenWasEmployeeInformed);
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
      await selectDayInCalendar(newValues?.proposedTerminationDate);
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

    const currentDate = getYearMonthDate(new Date());
    const dynamicDate = `${currentDate.year}-${currentDate.month}-15`;

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
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      acknowledge_termination_procedure: true,
      additional_comments: '',
      agrees_to_pto_amount: 'yes',
      agrees_to_pto_amount_notes: null,
      confidential: 'no',
      customer_informed_employee: 'no',
      customer_informed_employee_date: '',
      customer_informed_employee_description: '',
      personal_email: 'ze@remote.com',
      proposed_termination_date: dynamicDate,
      reason_description: 'whatever text',
      risk_assessment_reasons: ['sick_leave'],
      termination_reason: 'gross_misconduct',
      termination_reason_files: [],
      timesheet_file: undefined,
      will_challenge_termination: 'no',
      will_challenge_termination_description: null,
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
        additional_comments: null,
        agrees_to_pto_amount: true,
        confidential: false,
        customer_informed_employee: false,
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
