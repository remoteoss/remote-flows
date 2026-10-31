import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
import { $TSFixMe } from '@/src/types/remoteFlows';

function renderFlow({
  employmentId = 'employment-grace',
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
      render={(bag) => (
        <>
          {!bag.isLoading && <InvoiceScheduleForm />}
          <InvoiceSchedulePreviewButton onSuccess={onSuccess} onError={onError}>
            Preview invoice
          </InvoiceSchedulePreviewButton>
        </>
      )}
    />,
    { wrapper: TestProviders },
  );
}

async function fillValidInvoice() {
  await waitFor(() => {
    expect(screen.getByLabelText(/Invoice currency/i)).toBeInTheDocument();
  });
  await fillSelect('currency', 'EUR');
  await fillSelect('periodicity', 'monthly');
  fireEvent.click(screen.getByRole('radio', { name: 'No end date' }));
  await fillDatePickerByTestId('2100-01-01', 'start_date');
  fireEvent.change(screen.getByLabelText(/Item 1 description/i), {
    target: { value: 'Design work' },
  });
  fireEvent.change(screen.getByLabelText(/Item 1 amount/i), {
    target: { value: '2500.50' },
  });
}

describe('InvoiceSchedulePreviewButton', () => {
  beforeEach(() => {
    queryClient.clear();
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

    await fillValidInvoice();

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

    await fillValidInvoice();

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

  it('stays disabled while the flow has no contractor to preview against', async () => {
    // The endpoint is scoped to an employment. `employmentId` is required, but a consumer
    // reading it off a route that has not resolved yet hands over an empty string.
    renderFlow({ employmentId: '' });

    const button = await screen.findByRole(
      'button',
      { name: /Preview invoice/i },
      { timeout: 10000 },
    );
    expect(button).toBeDisabled();
  });

  it('reports a failed preview through onError', async () => {
    server.use(
      http.post('*/v1/employments/:id/contractor-invoices/preview', () =>
        HttpResponse.json({ message: 'Could not render' }, { status: 422 }),
      ),
    );

    const onError = vi.fn();
    renderFlow({ employmentId: 'employment-grace', onError });

    await fillValidInvoice();

    fireEvent.click(screen.getByRole('button', { name: /Preview invoice/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    expect(screen.queryByText(/Invoice Preview/i)).not.toBeInTheDocument();
  });

  it('validates the form and does not preview while it is invalid', async () => {
    const previewRequest = vi.fn();
    server.use(
      http.post('*/v1/employments/:id/contractor-invoices/preview', () => {
        previewRequest();
        return HttpResponse.json({
          data: {
            contractor_invoice_preview: {
              name: 'invoice-preview.pdf',
              content: 'data:application/pdf;base64,JVBERi0xLjQK',
            },
          },
        });
      }),
    );

    const onSuccess = vi.fn();
    const onError = vi.fn();
    renderFlow({ employmentId: 'employment-grace', onSuccess, onError });

    await waitFor(() => {
      expect(screen.getByLabelText(/Invoice currency/i)).toBeInTheDocument();
    });
    expect(screen.queryByText('Required field')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Preview invoice/i }));

    expect(
      (await screen.findAllByText('Required field')).length,
    ).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Item 1 description/i)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(previewRequest).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(screen.queryByTitle('invoice-preview.pdf')).not.toBeInTheDocument();
  });

  it('rejects invalid values from the headless previewInvoice without calling the API', async () => {
    const previewRequest = vi.fn();
    server.use(
      http.post('*/v1/employments/:id/contractor-invoices/preview', () => {
        previewRequest();
        return HttpResponse.json({ data: {} });
      }),
    );

    let bag: $TSFixMe;
    render(
      <InvoiceScheduleFlow
        employmentId='employment-grace'
        render={(invoiceScheduleBag) => {
          bag = invoiceScheduleBag;
          return null;
        }}
      />,
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      expect(bag?.isLoading).toBe(false);
    });

    await expect(bag.previewInvoice({})).rejects.toMatchObject({
      error: expect.any(Error),
      fieldErrors: expect.arrayContaining([
        expect.objectContaining({ messages: ['Required field'] }),
      ]),
    });
    expect(previewRequest).not.toHaveBeenCalled();
  });
});
