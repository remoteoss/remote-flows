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
import { InvoiceScheduleSubmitButton } from '@/src/flows/InvoiceSchedule/InvoiceScheduleSubmitButton';
import {
  contractorsListResponse,
  truncatedContractorsListResponse,
} from '@/src/flows/InvoiceSchedule/tests/fixtures';
import { employmentDefaultResponse } from '@/src/flows/Onboarding/tests/fixtures';
import { $TSFixMe } from '@/src/types/remoteFlows';

const employmentsListHandler = (body: Record<string, unknown>) =>
  http.get('*/v1/employments', () => HttpResponse.json(body));

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
      render={(invoiceScheduleBag) => (
        <>
          {invoiceScheduleBag.contractors.isTruncated && (
            <p>Showing some of your contractors</p>
          )}
          <InvoiceScheduleForm onSuccess={onSuccess} onError={onError} />
          <InvoiceScheduleSubmitButton>
            Create schedule
          </InvoiceScheduleSubmitButton>
        </>
      )}
    />,
    { wrapper: TestProviders },
  );
}

/**
 * Fills every required field other than the contractor picker and the periodicity, which the
 * individual tests drive themselves.
 */
async function fillScheduleDetails({
  currency = 'EUR',
}: { currency?: string } = {}) {
  await waitFor(() => {
    expect(screen.getByLabelText(/Invoice currency/i)).toBeInTheDocument();
  });

  await fillSelect('currency', currency);
  await fillDatePickerByTestId('2100-01-01', 'start_date');

  fireEvent.change(screen.getByLabelText(/Item 1 description/i), {
    target: { value: 'Design work' },
  });
  fireEvent.change(screen.getByLabelText(/Item 1 amount/i), {
    target: { value: '2500' },
  });
}

describe('InvoiceScheduleFlow', () => {
  beforeEach(() => {
    queryClient.clear();
    server.use(employmentsListHandler(contractorsListResponse));
  });

  it('renders a contractor picker populated from the employments list', async () => {
    renderFlow();

    // The picker renders with a placeholder option first, then rebuilds once the
    // employments query resolves.
    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Grace Hopper' }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('option', { name: 'Ada Lovelace' }),
    ).toBeInTheDocument();
  });

  it('omits the contractor picker when an employmentId is supplied', async () => {
    renderFlow({ employmentId: 'employment-grace' });

    await waitFor(() => {
      expect(screen.getByLabelText(/Invoice currency/i)).toBeInTheDocument();
    });

    expect(screen.queryByLabelText(/^Contractor$/i)).not.toBeInTheDocument();
  });

  it('reports when the contractor list is truncated', async () => {
    server.use(employmentsListHandler(truncatedContractorsListResponse));

    renderFlow();

    await waitFor(() => {
      expect(
        screen.getByText(/Showing some of your contractors/i),
      ).toBeInTheDocument();
    });
  });

  it('offers the one-off option alongside the recurring cadences', async () => {
    renderFlow({ employmentId: 'employment-grace' });

    await waitFor(() => {
      expect(screen.getByLabelText(/Frequency/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole('option', { name: 'One time' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Monthly' })).toBeInTheDocument();
  });

  it('restricts a Contractor of Record to one-off invoicing', async () => {
    server.use(
      http.get('*/v1/employments/:id', ({ params }) =>
        HttpResponse.json({
          ...employmentDefaultResponse,
          data: {
            ...employmentDefaultResponse.data,
            employment: {
              ...employmentDefaultResponse.data.employment,
              id: params.id,
              contractor_type: 'cor',
            },
          },
        }),
      ),
    );

    renderFlow({ employmentId: 'employment-grace' });

    // The schema rebuilds once the employment reveals the contractor is a CoR.
    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'One time' }),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('option', { name: 'Monthly' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Weekly' }),
    ).not.toBeInTheDocument();
  });

  it('encodes a one-off schedule as monthly with a single occurrence', async () => {
    let requestBody: $TSFixMe;
    server.use(
      http.post('*/v1/contractor-invoice-schedules', async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({
          data: { successes: [{ id: 'schedule-1' }], failures: [] },
        });
      }),
    );

    const onSuccess = vi.fn();
    renderFlow({ employmentId: 'employment-grace', onSuccess });

    await fillScheduleDetails();
    await fillSelect('periodicity', 'one_time');

    fireEvent.click(screen.getByRole('button', { name: /Create schedule/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    expect(requestBody).toEqual({
      contractor_invoice_schedules: [
        {
          employment_id: 'employment-grace',
          currency: 'EUR',
          periodicity: 'monthly',
          nr_occurrences: 1,
          start_date: '2100-01-01',
          items: [{ description: 'Design work', amount: 250000 }],
        },
      ],
    });
  });

  it('sends the chosen cadence for a recurring schedule', async () => {
    let requestBody: $TSFixMe;
    server.use(
      http.post('*/v1/contractor-invoice-schedules', async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({
          data: { successes: [{ id: 'schedule-1' }], failures: [] },
        });
      }),
    );

    const onSuccess = vi.fn();
    renderFlow({ employmentId: 'employment-grace', onSuccess });

    await fillScheduleDetails();
    await fillSelect('periodicity', 'weekly');

    fireEvent.click(screen.getByRole('button', { name: /Create schedule/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    expect(requestBody.contractor_invoice_schedules[0].periodicity).toBe(
      'weekly',
    );
    expect(requestBody.contractor_invoice_schedules[0]).not.toHaveProperty(
      'nr_occurrences',
    );
  });

  it('surfaces a creation failure through onError', async () => {
    server.use(
      http.post('*/v1/contractor-invoice-schedules', () =>
        HttpResponse.json({ message: 'Something went wrong' }, { status: 422 }),
      ),
    );

    const onError = vi.fn();
    renderFlow({ employmentId: 'employment-grace', onError });

    await fillScheduleDetails();
    await fillSelect('periodicity', 'monthly');

    fireEvent.click(screen.getByRole('button', { name: /Create schedule/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});
