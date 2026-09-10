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
import { employmentDefaultResponse } from '@/src/flows/Onboarding/tests/fixtures';
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
      render={() => (
        <>
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
 * Fills every required field other than the periodicity, which the individual tests drive
 * themselves.
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
  });

  it('renders the schedule form for the given contractor, without asking for one', async () => {
    renderFlow();

    await waitFor(() => {
      expect(screen.getByLabelText(/Invoice currency/i)).toBeInTheDocument();
    });

    expect(screen.queryByLabelText(/Contractor/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('employment_id')).not.toBeInTheDocument();
  });

  // A consumer reading the id off a route that has not resolved yet hands over an empty
  // string. The currencies query is disabled without one, so nothing is in flight and no
  // schema is built — reporting "ready" there hands back a form with no fields.
  it('keeps reporting loading while employmentId is empty', async () => {
    let sawReady = false;

    render(
      <InvoiceScheduleFlow
        employmentId=''
        render={(bag) => {
          if (bag.isLoading) return <p>Loading…</p>;
          sawReady = true;
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

    expect(await screen.findByText(/Loading…/i)).toBeInTheDocument();
    expect(sawReady).toBe(false);
  });

  // The Contractor-of-Record restriction only arrives with the employment, and it can
  // withdraw a frequency. Showing the form first lets the user pick one that then vanishes,
  // so `isLoading` waits for the employment as well as the currencies.
  it('keeps reporting loading until the employment resolves', async () => {
    let currenciesServed = false;
    let releaseEmployment: () => void = () => {};
    const employmentRequested = new Promise<void>((resolve) => {
      releaseEmployment = resolve;
    });

    server.use(
      // Served immediately, and recorded — once this has landed the employment is the only
      // request still outstanding, which is what makes the assertion below meaningful.
      http.get('*/v1/contractors/employments/*/contractor-currencies', () => {
        currenciesServed = true;
        return HttpResponse.json({
          data: [{ code: 'EUR', source: 'default_payment_currency' }],
        });
      }),
      http.get('*/v1/employments/:id', async ({ params }) => {
        await employmentRequested;
        return HttpResponse.json({
          ...employmentDefaultResponse,
          data: {
            ...employmentDefaultResponse.data,
            employment: {
              ...employmentDefaultResponse.data.employment,
              id: params.id,
            },
          },
        });
      }),
    );

    render(
      <InvoiceScheduleFlow
        employmentId='employment-grace'
        render={(bag) =>
          bag.isLoading ? <p>Loading…</p> : <InvoiceScheduleForm />
        }
      />,
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      expect(currenciesServed).toBe(true);
    });
    // Long enough for the schema to have been built and rendered had the employment not
    // been holding it back — without that settle this passes whether or not it waits.
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(screen.getByText(/Loading…/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Invoice currency/i),
    ).not.toBeInTheDocument();

    releaseEmployment();

    await waitFor(
      () => {
        expect(screen.getByLabelText(/Invoice currency/i)).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  });

  it('disables submission when there is no contractor to create for', async () => {
    render(
      <InvoiceScheduleFlow
        employmentId=''
        render={() => (
          <InvoiceScheduleSubmitButton>
            Create schedule
          </InvoiceScheduleSubmitButton>
        )}
      />,
      { wrapper: TestProviders },
    );

    expect(
      await screen.findByRole('button', { name: /Create schedule/i }),
    ).toBeDisabled();
  });

  it('refuses to create a schedule for an empty employmentId', async () => {
    let createCalls = 0;
    server.use(
      http.post('*/v1/contractor-invoice-schedules', () => {
        createCalls += 1;
        return HttpResponse.json({
          data: { successes: [{ id: 'schedule-1' }], failures: [] },
        });
      }),
    );

    const onError = vi.fn();
    render(
      <InvoiceScheduleFlow
        employmentId=''
        render={(bag) => (
          <button
            type='button'
            onClick={() => bag.onSubmit({}).catch((error) => onError(error))}
          >
            Submit directly
          </button>
        )}
      />,
      { wrapper: TestProviders },
    );

    fireEvent.click(screen.getByRole('button', { name: /Submit directly/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(createCalls).toBe(0);
  });

  it('offers the one-off option alongside the recurring cadences', async () => {
    renderFlow();

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

    renderFlow();

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
    renderFlow({ onSuccess });

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
    renderFlow({ onSuccess });

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
    renderFlow();

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
    renderFlow();

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

    renderFlow();

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

  it('surfaces a creation failure through onError', async () => {
    server.use(
      http.post('*/v1/contractor-invoice-schedules', () =>
        HttpResponse.json({ message: 'Something went wrong' }, { status: 422 }),
      ),
    );

    const onError = vi.fn();
    renderFlow({ onError });

    await fillScheduleDetails();
    await fillSelect('periodicity', 'monthly');

    fireEvent.click(screen.getByRole('button', { name: /Create schedule/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});
