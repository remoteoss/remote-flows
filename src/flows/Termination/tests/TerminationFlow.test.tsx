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

  function getYearMonthDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = date.getDay();

    return {
      year,
      month,
      day,
    };
  }

  async function fillStep1(
    values: Partial<{
      employeePersonalEmail: string;
      isRequestConfidential: string;
      isEmployeeInformed: string;
    }> = {
      employeePersonalEmail: 'ze@remote.com',
      isRequestConfidential: 'No',
      isEmployeeInformed: 'No',
    },
  ) {
    const user = userEvent.setup();
    if (values?.isRequestConfidential) {
      await fillRadio(
        'Is this request confidential?',
        values?.isRequestConfidential,
      );
    }
    if (values?.isEmployeeInformed) {
      await fillRadio(
        'Have you informed the employee of the termination?',
        values?.isEmployeeInformed,
      );
    }
    if (values?.employeePersonalEmail) {
      const employeePersonalEmail = screen.getByLabelText(
        /Employee's personal email/i,
      );
      await user.type(employeePersonalEmail, values?.employeePersonalEmail);
    }
  }

  async function fillStep2(
    values: Partial<{
      willChangeTermination: string;
      terminationReasonDetails: string;
      terminationReason: string;
      riskAssessmentReason: string;
      proposedTerminationDate: string;
    }> = {
      willChangeTermination: 'No',
      terminationReasonDetails: 'whatever text',
      terminationReason: 'Gross misconduct',
      riskAssessmentReason: 'Currently on or recently returned from sick leave',
      proposedTerminationDate: '15',
    },
  ) {
    const user = userEvent.setup();
    if (values?.willChangeTermination) {
      await fillRadio(
        'Do you consider it is likely that the employee will challenge their termination?',
        values?.willChangeTermination,
      );
    }

    if (values?.terminationReasonDetails) {
      const terminationReasonDetails = screen.getByLabelText(
        /Termination reason details/i,
      );
      await user.type(
        terminationReasonDetails,
        values?.terminationReasonDetails,
      );
    }

    if (values?.terminationReason) {
      await fillSelect('Termination reason', values?.terminationReason);
    }

    if (values?.riskAssessmentReason) {
      await fillCheckbox(values?.riskAssessmentReason);
    }
    if (values?.proposedTerminationDate) {
      await selectDayInCalendar(values?.proposedTerminationDate);
    }
  }

  async function fillStep3(
    values: Partial<{ agreePTO: string }> = {
      agreePTO: 'Yes',
    },
  ) {
    if (values?.agreePTO) {
      await fillRadio(
        'Are these paid time off records correct?',
        values?.agreePTO,
      );
    }
  }

  async function fillStep4(
    values: Partial<{
      ackowledgeTermination: boolean;
    }> = {
      ackowledgeTermination: true,
    },
  ) {
    if (values?.ackowledgeTermination) {
      await fillCheckbox(
        'I, ze have read and agree to the procedures as defined in the termination form.',
      );
    }
  }

  it('should render first step of the form', async () => {
    render(<TerminationFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Employee Communication/i);
  });

  it('should submit the termination flow', async () => {
    render(<TerminationFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Employee Communication/i);

    await fillStep1();

    let nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        status: 'step-employee_communication',
        payload: {
          acknowledge_termination_procedure: false,
          additional_comments: '',
          agrees_to_pto_amount: '',
          agrees_to_pto_amount_notes: null,
          confidential: 'no',
          customer_informed_employee: 'no',
          customer_informed_employee_date: '',
          customer_informed_employee_description: '',
          personal_email: 'ze@remote.com',
          proposed_termination_date: '',
          reason_description: '',
          risk_assessment_reasons: [],
          termination_reason: undefined,
          termination_reason_files: [],
          timesheet_file: undefined,
          will_challenge_termination: '',
          will_challenge_termination_description: null,
        },
      });
    });

    await screen.findByText(/Step: Termination Details/i);

    await fillStep2();

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(2);
    });

    const secondCallArgs = mockOnSubmit.mock.calls[1][0];

    const currentDate = getYearMonthDate(new Date());
    const dynamicDate = `${currentDate.year}-${currentDate.month}-15`;

    expect(secondCallArgs).toEqual({
      status: 'step-termination_details',
      payload: {
        acknowledge_termination_procedure: false,
        additional_comments: '',
        agrees_to_pto_amount: '',
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
      },
    });

    await screen.findByText(/Step: Paid Time Off/i);

    await fillStep3();

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(3);
    });

    const thirdCallArgs = mockOnSubmit.mock.calls[2][0];

    expect(thirdCallArgs).toEqual({
      status: 'step-paid_time_off',
      payload: {
        acknowledge_termination_procedure: false,
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
      },
    });

    await screen.findByText(/Step: Additional Information/i);

    await fillStep4();

    const submitButton = screen.getByText(/Send termination/i);
    expect(submitButton).toBeInTheDocument();
    submitButton.click();
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(4);
    });
    const fourthCallArgs = mockOnSubmit.mock.calls[3][0];

    expect(fourthCallArgs).toEqual({
      status: 'last-step',
      payload: {
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
      },
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
    await fillStep1();
    let nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await screen.findByText(/Step: Termination Details/i);

    await fillStep2();

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Paid Time Off/i);

    await fillStep3();

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await screen.findByText(/Step: Additional Information/i);

    await fillStep4();

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

    fillStep1({
      employeePersonalEmail: 'ze@remote.com',
    });

    nextButton.click();

    const errors = await screen.findAllByText(/Required field/i);

    expect(errors.length).toBeGreaterThan(0);
  });
});
