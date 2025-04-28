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
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <FormFieldsProvider components={{}}>{children}</FormFieldsProvider>
  </QueryClientProvider>
);

const mockOnSubmit = vi.fn();

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
          onSubmit={(data) => {
            console.log('data', data);
            mockOnSubmit(data);
          }}
          onError={(error) => console.log('error', error)}
          onSuccess={(data) => console.log('data', data)}
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
  beforeEach(() => {
    vi.clearAllMocks();

    // TODO: Mock the Post response after creating a termination
    server.use();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // TODO: move this to a helper function
  async function fillRadio(radioName: string, radioValue: string) {
    const user = userEvent.setup();
    const radioGroup = screen.getByRole('radiogroup', {
      name: new RegExp(radioName, 'i'),
    });
    expect(radioGroup).toBeInTheDocument();

    const radioButton = within(radioGroup).getByRole('radio', {
      name: new RegExp(radioValue, 'i'),
    });
    expect(radioButton).toBeInTheDocument();

    await user.click(radioButton);
  }

  // TODO: move this to a helper function
  async function fillSelect(selectName: string, selectValue: string) {
    const user = userEvent.setup();
    const select = screen.getByRole('combobox', {
      name: new RegExp(selectName, 'i'),
    });
    expect(select).toBeInTheDocument();

    await user.click(select);

    const option = screen.getByRole('option', {
      name: new RegExp(selectValue, 'i'),
    });
    expect(option).toBeInTheDocument();

    await user.click(option);
  }

  async function fillCheckbox(checkboxName: string) {
    const user = userEvent.setup();
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(checkboxName, 'i'),
    });
    expect(checkbox).toBeInTheDocument();
    await user.click(checkbox);
  }

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
      const datePickerButton = screen.getByTestId('date-picker-button');
      await user.click(datePickerButton);
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      const calendar = screen.getByRole('dialog');
      expect(calendar).toBeInTheDocument();
      const dateButton = screen.getByRole('button', {
        name: new RegExp(values.proposedTerminationDate, 'i'),
      });
      await user.click(dateButton);
      waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    }
  }

  it('should render first step of the form', async () => {
    render(<TerminationFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Employee Communication/i);
  });

  // for some reason this tests fails when executed after all the other tests, it's like some share state or something similar
  it('should submit the second step of the form and go to the next step', async () => {
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
  });

  it('should fill the first step of the form and go to the next step', async () => {
    render(<TerminationFlow {...defaultProps} />, { wrapper });

    await screen.findByText(/Step: Employee Communication/i);

    await fillStep1();

    const nextButton = screen.getByText(/Next Step/i);
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
