import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { TimeOffFlow, TimeOffReviewStepProps } from '@/src/index';
import { timeOffRequestResponse } from '@/src/flows/TimeOff/tests/fixtures';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

function renderFlow(
  timeOffId?: string,
  reviewStepProps: TimeOffReviewStepProps = {},
) {
  return render(
    <TimeOffFlow
      timeOffId={timeOffId}
      render={({
        timeOffBag,
        components: {
          RequestIdStep,
          NextButton,
          ReviewStep,
          RetryButton,
          BackButton,
        },
      }) => (
        <>
          <h2>Time off</h2>
          {timeOffBag.stepState.currentStep.name === 'request_id' && (
            <>
              <RequestIdStep />
              <NextButton>Next</NextButton>
            </>
          )}
          {timeOffBag.stepState.currentStep.name === 'review' && (
            <>
              <p>Reviewing {timeOffBag.timeOffId}</p>
              {timeOffBag.isLoading && <p>Loading time-off request</p>}
              {timeOffBag.timeOffRequestError && (
                <>
                  <p role='alert'>{timeOffBag.timeOffRequestError.reason}</p>
                  <RetryButton>Try again</RetryButton>
                </>
              )}
              <ReviewStep {...reviewStepProps} />
              <BackButton>Back</BackButton>
            </>
          )}
        </>
      )}
    />,
    { wrapper: TestProviders },
  );
}

function mockTimeOffRequest(
  timeoff: Partial<typeof timeOffRequestResponse.data.timeoff> = {},
) {
  const requestedIds: string[] = [];
  server.use(
    http.get('*/v1/timeoff/:id', ({ params }) => {
      requestedIds.push(params.id as string);
      return HttpResponse.json({
        data: {
          timeoff: {
            ...timeOffRequestResponse.data.timeoff,
            id: params.id,
            ...timeoff,
          },
        },
      });
    }),
  );
  return requestedIds;
}

describe('TimeOffFlow', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('keeps Next disabled until a non-blank request ID is entered', async () => {
    renderFlow();

    const input = await screen.findByLabelText('Time off request ID');
    const next = screen.getByRole('button', { name: 'Next' });
    expect(next).toBeDisabled();

    await userEvent.type(input, '   ');
    expect(next).toBeDisabled();

    await userEvent.type(input, 'timeoff-123');
    expect(next).toBeEnabled();
  });

  it('requests nothing on the request ID step, then reviews the entered request', async () => {
    const requests: string[] = [];
    const onRequest = ({ request }: { request: Request }) => {
      requests.push(request.url);
    };
    server.events.on('request:start', onRequest);
    const requestedIds = mockTimeOffRequest();

    renderFlow(undefined, { children: <p>Actions on the request</p> });

    await userEvent.type(
      await screen.findByLabelText('Time off request ID'),
      'timeoff-123',
    );
    expect(requests).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(
      await screen.findByText('Reviewing timeoff-123'),
    ).toBeInTheDocument();
    expect(screen.getByText('Loading time-off request')).toBeInTheDocument();
    expect(await screen.findByText('Paid time off')).toBeInTheDocument();
    expect(screen.getByText('Requested')).toBeInTheDocument();
    expect(screen.getByText('Nov 16, 2026')).toBeInTheDocument();
    expect(screen.getByText('Nov 17, 2026')).toBeInTheDocument();
    expect(screen.getByText('16 hours')).toBeInTheDocument();
    expect(screen.getByText('Family trip')).toBeInTheDocument();
    expect(screen.getByText('Actions on the request')).toBeInTheDocument();

    server.events.removeListener('request:start', onRequest);
    expect(requestedIds).toEqual(['timeoff-123']);
  });

  it('reviews the request supplied by the host', async () => {
    mockTimeOffRequest();
    renderFlow('timeoff-456');

    expect(await screen.findByLabelText('Time off request ID')).toHaveValue(
      'timeoff-456',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(
      await screen.findByText('Reviewing timeoff-456'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Paid time off')).toBeInTheDocument();
  });

  it.each([
    [404, 'not_found', { error: { message: 'Not Found' } }],
    [403, 'unauthorized', { message: 'Forbidden' }],
    [500, 'request_failed', { message: 'Internal server error' }],
  ])(
    'reports a %i response as %s and lets the user go back',
    async (status, reason, body) => {
      server.use(
        http.get('*/v1/timeoff/:id', () => HttpResponse.json(body, { status })),
      );
      const { container } = renderFlow('timeoff-123');

      fireEvent.click(await screen.findByRole('button', { name: 'Next' }));

      expect(await screen.findByRole('alert')).toHaveTextContent(reason);
      expect(
        container.querySelector('.RemoteFlows__ReviewStep'),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Back' }));

      expect(await screen.findByLabelText('Time off request ID')).toHaveValue(
        'timeoff-123',
      );
    },
  );

  it('recovers when a failed load is retried', async () => {
    let attempts = 0;
    server.use(
      http.get('*/v1/timeoff/:id', () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json({ message: 'Unavailable' }, { status: 503 })
          : HttpResponse.json(timeOffRequestResponse);
      }),
    );
    renderFlow('timeoff-123');

    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Paid time off')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('reviews another request after going back and entering a new ID', async () => {
    const requestedIds = mockTimeOffRequest();
    renderFlow('timeoff-123');

    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Paid time off')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    const input = await screen.findByLabelText('Time off request ID');
    await userEvent.clear(input);
    await userEvent.type(input, 'timeoff-789');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(
      await screen.findByText('Reviewing timeoff-789'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Paid time off')).toBeInTheDocument();
    expect(requestedIds).toEqual(['timeoff-123', 'timeoff-789']);
  });

  it.each([
    ['cancel_requested', 'Cancellation requested'],
    ['cancelled', 'Cancelled'],
  ] as const)(
    'shows a %s request without adding actions',
    async (status, label) => {
      mockTimeOffRequest({ status, cancel_reason: 'Plans changed' });
      renderFlow('timeoff-123');

      fireEvent.click(await screen.findByRole('button', { name: 'Next' }));

      expect(await screen.findByText(label)).toBeInTheDocument();
      expect(screen.getByText('Plans changed')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toEqual([
        screen.getByRole('button', { name: 'Back' }),
      ]);
    },
  );

  it('lets the consumer render the request details', async () => {
    mockTimeOffRequest();
    renderFlow('timeoff-123', {
      render: ({ timeOffRequest, details }) => (
        <ul>
          <li>{timeOffRequest.timezone}</li>
          {details.map((detail) => (
            <li key={detail.name}>
              {detail.name}: {detail.value}
            </li>
          ))}
        </ul>
      ),
    });

    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Europe/Madrid')).toBeInTheDocument();
    expect(screen.getByText('status: Requested')).toBeInTheDocument();
    expect(screen.queryByText('Status')).not.toBeInTheDocument();
  });
});
