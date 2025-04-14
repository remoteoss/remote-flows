import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { server } from '@/src/tests/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContractAmendmentFlow, RenderProps } from '../ContractAmendmentFlow';
import { contractAmendementSchema, employment } from './fixtures';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <FormFieldsProvider components={{}}>{children}</FormFieldsProvider>
  </QueryClientProvider>
);

const mockError = vi.fn();
const mockSuccess = vi.fn();
const mockOnSubmit = vi.fn();

describe('ContractAmendmentFlow', () => {
  const mockRender = vi.fn(({ components }: RenderProps) => (
    <div>
      <components.Form
        onError={mockError}
        onSuccess={mockSuccess}
        onSubmit={mockOnSubmit}
      />
      <components.SubmitButton>Submit</components.SubmitButton>
      {/* <components.ConfirmationForm /> */}
    </div>
  ));

  const defaultProps = {
    employmentId: '2ef4068b-11c7-4942-bb3c-70606c83688e',
    countryCode: 'PRT',
    options: {},
    render: mockRender,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    server.use(
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json(employment);
      }),
      http.get('*/v1/contract-amendments/schema*', () => {
        return HttpResponse.json(contractAmendementSchema);
      }),
      http.post('*/v1/contract-amendments/automatable', () => {
        return HttpResponse.json({ automatable: true });
      }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // it('renders the flow with all components', async () => {
  //   render(<ContractAmendmentFlow {...defaultProps} />, { wrapper });

  //   await waitFor(() => {
  //     expect(
  //       screen.getByRole('button', { name: /submit/i }),
  //     ).toBeInTheDocument();
  //   });
  //   await waitFor(() => {
  //     expect(screen.getByLabelText('Reason for change')).toBeInTheDocument();
  //   });
  //   expect(screen.getByText('Effective date of change')).toBeInTheDocument();
  // });

  // it('passes the correct contractAmendmentBag to render prop', async () => {
  //   render(<ContractAmendmentFlow {...defaultProps} />, { wrapper });

  //   await waitFor(() => {
  //     expect(mockRender).toHaveBeenCalled();
  //     const renderProps = mockRender.mock.calls[0][0];

  //     expect(renderProps.contractAmendmentBag).toHaveProperty('initialValues');
  //     expect(renderProps.contractAmendmentBag).toHaveProperty(
  //       'handleValidation',
  //     );
  //     expect(renderProps.components).toHaveProperty('Form');
  //     expect(renderProps.components).toHaveProperty('SubmitButton');
  //     expect(renderProps.components).toHaveProperty('ConfirmationForm');
  //   });
  // });

  it('submits the form when contract details are changed', async () => {
    const user = userEvent.setup();
    render(<ContractAmendmentFlow {...defaultProps} />, { wrapper });

    // Change annual gross salary
    await waitFor(() => {
      expect(screen.getByText('Annual gross salary')).toBeInTheDocument();
    });
    await user.type(screen.getByLabelText('Annual gross salary'), '360000');

    // change effective date
    const datePickerButton = screen.getByTestId('date-picker-button');
    await user.click(datePickerButton);
    waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const calendar = screen.getByRole('dialog');
    expect(calendar).toBeInTheDocument();
    const dateButton = screen.getByRole('button', { name: /15/i });
    await user.click(dateButton);
    waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // submit contract amendment
    const submitButton = screen.getByRole('button', { name: /submit/i });
    submitButton.click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        additional_comments_toggle: false,
        annual_gross_salary: '360000',
        contract_duration_type: 'indefinite',
        effective_date: '2025-04-15',
        experience_level:
          'Level 3 - Associate - Employees who perform independently tasks and/or with coordination and control functions',
        job_title: 'engineer',
        reason_for_change: '',
        role_description:
          'Very nice job.Very nice job.Very nice job.Very nice job.Very nice job.Very nice job.Very nice job.Very nice job.',
        work_hours_per_week: 40,
        work_schedule: 'full_time',
      });
    });
  });

  it('shows error when only static fields are changed', async () => {
    const user = userEvent.setup();
    render(<ContractAmendmentFlow {...defaultProps} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Annual gross salary')).toBeInTheDocument();
    });

    // change effective date
    const datePickerButton = screen.getByTestId('date-picker-button');
    await user.click(datePickerButton);
    waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    const calendar = screen.getByRole('dialog');
    expect(calendar).toBeInTheDocument();
    const dateButton = screen.getByRole('button', { name: /15/i });
    await user.click(dateButton);
    waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // submit contract amendment
    const submitButton = screen.getByRole('button', { name: /submit/i });
    submitButton.click();

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith({
        message: 'no_changes_detected_contract_details',
      });
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      http.get('*/api/v1/employments/:employmentId', () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    render(<ContractAmendmentFlow {...defaultProps} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
