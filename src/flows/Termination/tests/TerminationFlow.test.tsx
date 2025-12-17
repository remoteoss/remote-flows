import { server } from '@/src/tests/server';
import { TerminationFlow } from '@/src/flows/Termination/TerminationFlow';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  fillCheckbox,
  fillRadio,
  fillSelect,
  fillDatePicker,
  TestProviders,
  queryClient,
} from '@/src/tests/testHelpers';
import { http, HttpResponse } from 'msw';
import {
  terminationResponse,
  approvedTimeoffs,
  timeoffLeavePoliciesSummaryResponse,
} from '@/src/flows/Termination/tests/fixtures';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { TerminationRenderProps } from '@/src/flows/Termination/types';
import { employment } from '@/src/tests/fixtures';
import { getYearMonthDate } from '@/src/common/dates';
import { format } from 'date-fns';

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
    } = components;
    switch (terminationBag.stepState.currentStep.name) {
      case 'employee_communication':
        return (
          <>
            <div className='alert'>
              <p>
                Please do not inform the employee of their termination until we
                review your request for legal risks. When we approve your
                request, you can inform the employee and we'll take it from
                there.
              </p>
            </div>
            <EmployeeComunicationStep
              onSubmit={(payload: $TSFixMe) =>
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
              onSubmit={(payload: $TSFixMe) =>
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
            <PaidTimeOffStep
              onSubmit={(payload: $TSFixMe) =>
                onSubmitStep(payload, 'paid_time_off')
              }
            />
            <Back>Back</Back>
            <SubmitButton>Next Step</SubmitButton>
          </>
        );

      case 'additional_information':
        return (
          <>
            <AdditionalDetailsStep
              onSubmit={(payload: $TSFixMe) => onSubmitForm(payload)}
              onSuccess={onSuccess}
              onError={onError}
            />
            <Back>Back</Back>
            <SubmitButton>Send termination</SubmitButton>
          </>
        );
    }

    return null;
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
    mockRender.mockReset();
    queryClient.clear();

    server.use(
      http.get('*/v1/payroll-calendars*', () => {
        return HttpResponse.json({ data: [] });
      }),
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json(employment);
      }),
      http.get('*/v1/timeoff*', () => {
        return HttpResponse.json(approvedTimeoffs);
      }),
      http.get('*/v1/timeoff-leave-policies-summary*', () => {
        return HttpResponse.json(timeoffLeavePoliciesSummaryResponse);
      }),
      http.get('*/v1/leave-policies/summary/*', () => {
        return HttpResponse.json(timeoffLeavePoliciesSummaryResponse);
      }),
      http.post('*/v1/offboardings', async (req) => {
        offboardingRequest = (await req.request.json()) as Record<
          string,
          unknown
        >;
        return HttpResponse.json(terminationResponse);
      }),
    );
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
      await waitFor(() => {
        expect(
          screen.getByLabelText(
            /When the employee was told about the termination/i,
          ),
        ).toBeInTheDocument();
      });
      await fillDatePicker(
        newValues?.whenWasEmployeeInformed,
        'When the employee was told about the termination',
      );
    }

    if (
      newValues?.isEmployeeInformed === 'Yes' &&
      newValues?.howDidYouShareTheInformation
    ) {
      const howDidYouShareTheInformation = screen.getByLabelText(
        /How did you share this information?/i,
      );
      fireEvent.change(howDidYouShareTheInformation, {
        target: { value: newValues?.howDidYouShareTheInformation },
      });
    }

    if (newValues?.employeePersonalEmail) {
      const employeePersonalEmail = screen.getByLabelText(
        /Employee's personal email/i,
      );
      fireEvent.change(employeePersonalEmail, {
        target: { value: newValues?.employeePersonalEmail },
      });
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
      fireEvent.change(terminationReasonDetails, {
        target: { value: newValues?.terminationReasonDetails },
      });
    }

    if (newValues?.terminationReason) {
      await fillSelect('Termination reason', newValues?.terminationReason);
    }

    if (newValues?.riskAssessmentReason) {
      await fillCheckbox(newValues?.riskAssessmentReason);
    }
    if (newValues?.proposedTerminationDate) {
      await fillDatePicker(
        newValues?.proposedTerminationDate,
        'Proposed termination date',
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
      await waitFor(() => {
        expect(
          screen.getByRole('checkbox', {
            name: /I agree to the procedures in this form/i,
          }),
        ).toBeInTheDocument();
      });
      await fillCheckbox('I agree to the procedures in this form');
    }
  }

  it('should render first step of the form', async () => {
    render(<TerminationFlow {...defaultProps} />, { wrapper: TestProviders });

    await screen.findByText(/Step: Employee Communication/i);
  });

  it('should render the conditional fields of the radio after only touching the radio field', async () => {
    render(<TerminationFlow {...defaultProps} />, { wrapper: TestProviders });
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

  it('should preserve updated field values when navigating back to previous step', async () => {
    render(
      <TerminationFlow
        {...defaultProps}
        initialValues={{
          personal_email: 'john.doe@example.com',
        }}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByText(/Step: Employee Communication/i);

    // Verify initial value is populated
    await waitFor(() => {
      expect(
        screen.getByLabelText(/Employee's personal email/i),
      ).toBeInTheDocument();
    });
    const employeePersonalEmail = screen.getByLabelText(
      /Employee's personal email/i,
    );
    expect(employeePersonalEmail).toHaveValue('john.doe@example.com');

    await fillEmployeeCommunication({
      employeePersonalEmail: 'ze@remote.com',
    });

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await screen.findByText(/Step: Termination Details/i);

    // Go back to previous step
    const backButton = screen.getByText(/Back/i);
    expect(backButton).toBeInTheDocument();
    backButton.click();

    // Assert that ze@remote.com is retained (not the original john.doe@example.com)
    await screen.findByText(/Step: Employee Communication/i);
    const emailFieldAfterNavigation = screen.getByLabelText(
      /Employee's personal email/i,
    );
    expect(emailFieldAfterNavigation).toHaveValue('ze@remote.com');
  });

  it('should render will_challenge_termination details field immediately after selecting will_challenge_termination', async () => {
    render(<TerminationFlow {...defaultProps} />, { wrapper: TestProviders });
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
    render(<TerminationFlow {...defaultProps} />, { wrapper: TestProviders });

    await screen.findByText(/Step: Employee Communication/i);

    await fillEmployeeCommunication({
      isEmployeeInformed: 'Yes',
      whenWasEmployeeInformed: '2025-11-26',
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
    const proposedTerminationDate = `${currentDate.year}-${currentDate.month}-${currentDate.day}`;

    render(<TerminationFlow {...defaultProps} />, { wrapper: TestProviders });

    await screen.findByText(/Step: Employee Communication/i);

    await fillEmployeeCommunication({
      isEmployeeInformed: 'Yes',
      whenWasEmployeeInformed: dynamicDate,
    });

    let nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmitStep).toHaveBeenCalledTimes(1);
    });
    expect(mockOnSubmitStep).toHaveBeenCalledWith(
      {
        confidential: 'no',
        customer_informed_employee: 'yes',
        customer_informed_employee_date: dynamicDate,
        customer_informed_employee_description: 'Whatever text',
        personal_email: 'ze@remote.com',
      },
      'employee_communication',
    );
    await screen.findByText(/Step: Termination Details/i);
    await fillTerminationDetails({
      proposedTerminationDate: proposedTerminationDate,
    });

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmitStep).toHaveBeenCalledTimes(2);
    });
    expect(mockOnSubmitStep.mock.calls[1]).toEqual([
      {
        proposed_termination_date: proposedTerminationDate,
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
        agrees_to_pto_amount: 'yes',
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
      proposed_termination_date: `${currentDate.year}-${currentDate.month}-${currentDate.day}`,
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
        proposed_termination_date: `${currentDate.year}-${currentDate.month}-${currentDate.day}`,
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
    render(<TerminationFlow {...defaultProps} />, { wrapper: TestProviders });
    await screen.findByText(/Step: Employee Communication/i);
    await fillEmployeeCommunication();
    let nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await screen.findByText(/Step: Termination Details/i);

    const currentDate = getYearMonthDate(new Date());

    await fillTerminationDetails({
      proposedTerminationDate: `${currentDate.year}-${currentDate.month}-${currentDate.day}`,
    });

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
    render(<TerminationFlow {...defaultProps} />, { wrapper: TestProviders });

    await screen.findByText(/Step: Employee Communication/i);

    const nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByLabelText(/Employee's personal email/i),
      ).toBeInTheDocument();
    });

    const employeePersonalEmail = screen.getByLabelText(
      /Employee's personal email/i,
    );
    fireEvent.change(employeePersonalEmail, {
      target: { value: 'ze@remote.com' },
    });

    nextButton.click();

    const errors = await screen.findAllByText(/Required field/i);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pre-populate the form with the initial values', async () => {
    render(
      <TerminationFlow
        {...defaultProps}
        initialValues={{
          personal_email: 'john.doe@example.com',
        }}
      />,
      { wrapper: TestProviders },
    );
    await screen.findByText(/Step: Employee Communication/i);
    await waitFor(() => {
      expect(
        screen.getByLabelText(/Employee's personal email/i),
      ).toBeInTheDocument();
    });
    const employeePersonalEmail = screen.getByLabelText(
      /Employee's personal email/i,
    );
    expect(employeePersonalEmail).toHaveValue('john.doe@example.com');
  });

  it('should only show cancellation_before_start_date option when employment has future start date', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateString = format(futureDate, 'yyyy-MM-dd');

    server.use(
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json({
          data: {
            employment: {
              ...employment.data.employment,
              provisional_start_date: futureDateString,
            },
          },
        });
      }),
    );

    render(<TerminationFlow {...defaultProps} />, { wrapper: TestProviders });

    await screen.findByText(/Step: Employee Communication/i);
    await fillEmployeeCommunication();
    screen.getByText(/Next Step/i).click();
    await screen.findByText(/Step: Termination Details/i);

    // Verify it was selected by querying the select-value slot
    await waitFor(() => {
      const selectValue = document.querySelector('[data-slot="select-value"]');
      expect(selectValue).toBeInTheDocument();
      expect(selectValue?.textContent).toMatch(
        /Decision to cancel hiring before the employee starts/i,
      );
    });
  });

  it('should preserve proposed termination date when navigating from termination details to paid time off step', async () => {
    const proposedTerminationDate = '2025-12-17';

    render(<TerminationFlow {...defaultProps} />, { wrapper: TestProviders });

    await screen.findByText(/Step: Employee Communication/i);
    await fillEmployeeCommunication();

    let nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await screen.findByText(/Step: Termination Details/i);
    await fillTerminationDetails({
      proposedTerminationDate: proposedTerminationDate,
    });

    nextButton = screen.getByText(/Next Step/i);
    expect(nextButton).toBeInTheDocument();
    nextButton.click();

    await waitFor(() => {
      expect(mockOnSubmitStep).toHaveBeenCalledTimes(2);
    });

    await screen.findByText(/Step: Paid Time Off/i);

    await waitFor(() => {
      expect(
        screen.getByText(
          /The proposed termination date for .+ is December 17, 2025/i,
        ),
      ).toBeInTheDocument();
    });
  });
});
