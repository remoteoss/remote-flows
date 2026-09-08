import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/tests/server';
import {
  queryClient,
  TestProviders,
  fillSelect,
  fillDatePickerByTestId,
} from '@/src/tests/testHelpers';
import { InvoiceScheduleFlow } from '@/src/flows/InvoiceSchedule/InvoiceScheduleFlow';
import { InvoiceScheduleForm } from '@/src/flows/InvoiceSchedule/InvoiceScheduleForm';
import { InvoiceSchedulePreviewButton } from '@/src/flows/InvoiceSchedule/InvoiceSchedulePreviewButton';
import { contractorsListResponse } from '@/src/flows/InvoiceSchedule/tests/fixtures';
import { $TSFixMe } from '@/src/types/remoteFlows';

function renderFlow({
  employmentId,
  onSuccess,
  onError,
}: {
  employmentId?: string;
  onSuccess?: (data: $TSFixMe) => void;
  onError?: (error: $TSFixMe) => void;
} = {}) {
  return render(
    <InvoiceScheduleFlow
      employmentId={employmentId}
      render={() => (
        <>
          <InvoiceScheduleForm />
          <InvoiceSchedulePreviewButton onSuccess={onSuccess} onError={onError}>
            Preview invoice
          </InvoiceSchedulePreviewButton>
        </>
      )}
    />,
    { wrapper: TestProviders },
  );
}

describe('InvoiceSchedulePreviewButton', () => {
  beforeEach(() => {
    queryClient.clear();
    server.use(
      http.get('*/v1/employments', () =>
        HttpResponse.json(contractorsListResponse),
      ),
    );
  });

  it('previews the invoice the form describes, without creating a schedule', async () => {
    let previewBody: $TSFixMe;
    let createCalls = 0;
    server.use(
      http.post(
        '*/v1/employments/:id/contractor-invoices/preview',
        async ({ request }) => {
          previewBody = await request.json();
          return HttpResponse.json({
            data: {
              contractor_invoice_preview: {
                name: 'invoice-preview.pdf',
                content: 'data:application/pdf;base64,JVBERi0xLjQK',
              },
            },
          });
        },
      ),
      http.post('*/v1/contractor-invoice-schedules', () => {
        createCalls += 1;
        return HttpResponse.json({ data: { successes: [] } });
      }),
    );

    const onSuccess = vi.fn();
    renderFlow({ employmentId: 'employment-grace', onSuccess });

    await waitFor(() => {
      expect(screen.getByLabelText(/Invoice currency/i)).toBeInTheDocument();
    });
    await fillSelect('currency', 'EUR');
    await fillSelect('periodicity', 'monthly');
    await fillDatePickerByTestId('2100-01-01', 'start_date');
    fireEvent.change(screen.getByLabelText(/Item 1 description/i), {
      target: { value: 'Design work' },
    });
    fireEvent.change(screen.getByLabelText(/Item 1 amount/i), {
      target: { value: '2500.50' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Preview invoice/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        name: 'invoice-preview.pdf',
        content: 'data:application/pdf;base64,JVBERi0xLjQK',
      });
    });

    // A preview covers a single invoice, so the recurrence fields are left out — and the
    // money amount is sent in cents, as it is on create.
    expect(previewBody).toEqual({
      currency: 'EUR',
      start_date: '2100-01-01',
      items: [{ description: 'Design work', amount: 250050 }],
    });
    expect(createCalls).toBe(0);
  });

  it('shows the returned PDF in a drawer', async () => {
    renderFlow({ employmentId: 'employment-grace' });

    await waitFor(() => {
      expect(screen.getByLabelText(/Invoice currency/i)).toBeInTheDocument();
    });

    // The drawer is opened by the preview itself, not by the trigger, so nothing is on
    // screen until the PDF comes back.
    expect(screen.queryByText(/Invoice Preview/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle('invoice-preview.pdf')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Preview invoice/i }));

    expect(
      await screen.findByText(/Invoice Preview/i, undefined, {
        timeout: 10000,
      }),
    ).toBeInTheDocument();

    const frame = screen.getByTitle('invoice-preview.pdf');
    expect(frame).toHaveAttribute(
      'src',
      'data:application/pdf;base64,JVBERi0xLjQK',
    );
  });

  it('stays disabled until a contractor is chosen', async () => {
    const user = userEvent.setup();
    renderFlow();

    const button = await screen.findByRole(
      'button',
      { name: /Preview invoice/i },
      { timeout: 10000 },
    );
    // Nothing to preview against: the endpoint is scoped to an employment.
    expect(button).toBeDisabled();

    await user.click(
      await screen.findByRole('combobox', { name: /Contractor/i }),
    );
    await user.click(
      await screen.findByRole('option', { name: 'Grace Hopper' }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Preview invoice/i }),
      ).toBeEnabled();
    });
  });

  it('reports a failed preview through onError', async () => {
    server.use(
      http.post('*/v1/employments/:id/contractor-invoices/preview', () =>
        HttpResponse.json({ message: 'Could not render' }, { status: 422 }),
      ),
    );

    const onError = vi.fn();
    renderFlow({ employmentId: 'employment-grace', onError });

    await waitFor(() => {
      expect(screen.getByLabelText(/Invoice currency/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Preview invoice/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    expect(screen.queryByText(/Invoice Preview/i)).not.toBeInTheDocument();
  });
});
