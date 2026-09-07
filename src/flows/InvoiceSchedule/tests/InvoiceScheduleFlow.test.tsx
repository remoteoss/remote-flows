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

  it('renders a searchable contractor picker and lists contractors when opened', async () => {
    const user = userEvent.setup();
    renderFlow();

    const trigger = await screen.findByRole(
      'combobox',
      { name: /Contractor/i },
      { timeout: 10000 },
    );

    await user.click(trigger);

    expect(
      await screen.findByRole('option', { name: 'Grace Hopper' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Ada Lovelace' }),
    ).toBeInTheDocument();
  });

  it('asks the API to filter by name as the user types', async () => {
    const requestedNames: (string | null)[] = [];
    server.use(
      http.get('*/v1/employments', ({ request }) => {
        const name = new URL(request.url).searchParams.get('name');
        requestedNames.push(name);
        const all = contractorsListResponse.data.employments;
        const matched = name
          ? all.filter((e) =>
              e.full_name.toLowerCase().includes(name.toLowerCase()),
            )
          : all;
        return HttpResponse.json({
          data: {
            ...contractorsListResponse.data,
            employments: matched,
            total_count: matched.length,
          },
        });
      }),
    );

    const user = userEvent.setup();
    renderFlow();

    const trigger = await screen.findByRole(
      'combobox',
      { name: /Contractor/i },
      { timeout: 10000 },
    );
    await user.click(trigger);

    await user.type(screen.getByPlaceholderText(/Search contractors/i), 'hopp');

    // Debounced, so the filtered request lands a moment after typing stops.
    await waitFor(
      () => {
        expect(requestedNames).toContain('hopp');
      },
      { timeout: 10000 },
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('option', { name: 'Ada Lovelace' }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole('option', { name: 'Grace Hopper' }),
    ).toBeInTheDocument();
  });

  it('selects a contractor from the picker', async () => {
    const user = userEvent.setup();
    renderFlow();

    const trigger = await screen.findByRole(
      'combobox',
      { name: /Contractor/i },
      { timeout: 10000 },
    );
    await user.click(trigger);
    await user.click(
      await screen.findByRole('option', { name: 'Grace Hopper' }),
    );

    // The chosen contractor stays visible on the trigger after the popover closes.
    await waitFor(() => {
      expect(trigger).toHaveTextContent('Grace Hopper');
    });
  });

  it('omits the contractor picker when an employmentId is supplied', async () => {
    renderFlow({ employmentId: 'employment-grace' });

    await waitFor(() => {
      expect(screen.getByLabelText(/Invoice currency/i)).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('combobox', { name: /Contractor/i }),
    ).not.toBeInTheDocument();
  });

  it('reports when the contractor list is truncated', async () => {
    server.use(employmentsListHandler(truncatedContractorsListResponse));

    renderFlow();

    expect(
      await screen.findByText(/Showing some of your contractors/i, undefined, {
        timeout: 10000,
      }),
    ).toBeInTheDocument();
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
    expect(
      await screen.findByRole(
        'option',
        { name: 'One time' },
        { timeout: 10000 },
      ),
    ).toBeInTheDocument();

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

  it('reveals the second item row once the first has a description and an amount', async () => {
    renderFlow({ employmentId: 'employment-grace' });

    await waitFor(() => {
      expect(screen.getByLabelText(/Item 1 description/i)).toBeInTheDocument();
    });

    expect(
      screen.queryByLabelText(/Item 2 description/i),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Item 1 description/i), {
      target: { value: 'Design work' },
    });
    fireEvent.blur(screen.getByLabelText(/Item 1 description/i));
    fireEvent.change(screen.getByLabelText(/Item 1 amount/i), {
      target: { value: '2500' },
    });
    fireEvent.blur(screen.getByLabelText(/Item 1 amount/i));

    await waitFor(
      () => {
        expect(
          screen.getByLabelText(/Item 2 description/i),
        ).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  });

  // The reveal condition used to require an integer, which the flow's own values can never
  // satisfy once an amount has cents: the money input holds major units and the schema is
  // built without the cents conversion, so `2500.50` stayed a decimal and froze the form at
  // one item. Driven through the rendered form because that is the only place the flow's
  // real `createHeadlessForm` call is exercised.
  it('reveals the second item row when the first amount has cents', async () => {
    renderFlow({ employmentId: 'employment-grace' });

    await waitFor(() => {
      expect(screen.getByLabelText(/Item 1 description/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Item 1 description/i), {
      target: { value: 'Design work' },
    });
    fireEvent.blur(screen.getByLabelText(/Item 1 description/i));
    fireEvent.change(screen.getByLabelText(/Item 1 amount/i), {
      target: { value: '2500.50' },
    });
    fireEvent.blur(screen.getByLabelText(/Item 1 amount/i));

    await waitFor(
      () => {
        expect(
          screen.getByLabelText(/Item 2 description/i),
        ).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  });

  it('keeps the form mounted while the chosen contractor loads', async () => {
    const user = userEvent.setup();
    let sawLoadingAfterSelection = false;

    render(
      <InvoiceScheduleFlow
        render={(bag) => {
          if (bag.isLoading) return <p>Loading contractors…</p>;
          if (bag.isLoadingContractorDetails) sawLoadingAfterSelection = true;
          return (
            <>
              <InvoiceScheduleForm />
              <InvoiceScheduleSubmitButton>
                Create schedule
              </InvoiceScheduleSubmitButton>
            </>
          );
        }}
      />,
      { wrapper: TestProviders },
    );

    const trigger = await screen.findByRole(
      'combobox',
      { name: /Contractor/i },
      { timeout: 10000 },
    );
    await user.click(trigger);
    await user.click(
      await screen.findByRole('option', { name: 'Grace Hopper' }),
    );

    // The documented pattern returns early on isLoading; selecting a contractor must not
    // trip it, or the form unmounts mid-flow.
    await waitFor(() => {
      expect(screen.getByLabelText(/Invoice currency/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Loading contractors/i)).not.toBeInTheDocument();
    expect(sawLoadingAfterSelection).toBe(true);
  });

  it('clears currency and frequency when the contractor is switched', async () => {
    const user = userEvent.setup();
    renderFlow();

    const trigger = await screen.findByRole(
      'combobox',
      { name: /Contractor/i },
      { timeout: 10000 },
    );
    await user.click(trigger);
    await user.click(
      await screen.findByRole('option', { name: 'Grace Hopper' }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Invoice currency/i)).toBeInTheDocument();
    });
    await fillSelect('currency', 'EUR');
    await fillSelect('periodicity', 'weekly');

    // Switching contractor: the previous currency and frequency may not be offered for the
    // new one, so they must not carry over.
    await user.click(trigger);
    await user.click(
      await screen.findByRole('option', { name: 'Ada Lovelace' }),
    );

    await waitFor(() => {
      expect(screen.getByTestId('currency')).toHaveValue('');
    });
    expect(screen.getByTestId('periodicity')).toHaveValue('');
  });

  it('clears a recurring frequency chosen before the contractor turns out to be a CoR', async () => {
    // `contractor_type` only arrives with the employment, so the recurring cadences are on
    // offer until it does. Held open here to pick one inside that window.
    let revealContractorType: () => void = () => {};
    const employmentRequested = new Promise<void>((resolve) => {
      revealContractorType = resolve;
    });

    server.use(
      http.get('*/v1/employments/:id', async ({ params }) => {
        await employmentRequested;

        return HttpResponse.json({
          ...employmentDefaultResponse,
          data: {
            ...employmentDefaultResponse.data,
            employment: {
              ...employmentDefaultResponse.data.employment,
              id: params.id,
              contractor_type: 'cor',
            },
          },
        });
      }),
    );

    renderFlow({ employmentId: 'employment-grace' });

    await fillScheduleDetails();
    await fillSelect('periodicity', 'weekly');

    revealContractorType();

    await waitFor(() => {
      expect(
        screen.queryByRole('option', { name: 'Weekly' }),
      ).not.toBeInTheDocument();
    });

    // Asserting on the error rather than the select's value: the rendered select is a
    // native one in tests and blanks itself when its option disappears, whether or not the
    // form still holds the stale value. Submitting is what tells them apart — a form still
    // holding `weekly` is rejected for an option the user can no longer see, where a cleared
    // one asks them to pick a frequency.
    fireEvent.click(screen.getByRole('button', { name: /Create schedule/i }));

    expect(
      await screen.findByText(/Required field/i, undefined, { timeout: 10000 }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/is not valid/i)).not.toBeInTheDocument();
  });

  // The picker is supplied through `x-jsf-presentation.Component`, which `JSONSchemaForm`
  // renders on its own rather than inside a `FormField`. Without the field name in context,
  // the `FormMessage` the picker renders had no error to read and stayed silent, so a missing
  // contractor was the one required field that failed without saying so.
  it('reports a missing contractor on the picker itself', async () => {
    renderFlow();

    await screen.findByRole(
      'combobox',
      { name: /Contractor/i },
      { timeout: 10000 },
    );

    fireEvent.click(screen.getByRole('button', { name: /Create schedule/i }));

    const contractorField = await screen.findByTestId('employment_id');
    const fieldContainer = contractorField.closest('[data-field]');

    await waitFor(() => {
      expect(fieldContainer).toHaveTextContent(/Required field/i);
    });
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
