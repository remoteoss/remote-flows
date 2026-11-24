import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { PropsWithChildren } from 'react';
import {
  RemoteFlows,
  TimeOffApproveButtonProps,
  TimeOffDeclineButtonProps,
  TimeOffFlow,
  TimeOffReviewStepProps,
} from '@/src/index';
import {
  companyManagersResponse,
  declineReasonErrorResponse,
  timeOffErrorResponse,
  timeOffRequestResponse,
} from '@/src/flows/TimeOff/tests/fixtures';
import { defaultComponents } from '@/src/tests/defaultComponents';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

function renderFlow(
  timeOffId?: string,
  reviewStepProps: TimeOffReviewStepProps = {},
  wrapper = TestProviders,
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
    { wrapper },
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

function mockTeamMember(response: () => Response) {
  const requestedEmploymentIds: string[] = [];
  server.use(
    http.get('*/v1/employments/:id', ({ params }) => {
      requestedEmploymentIds.push(params.id as string);
      return response();
    }),
  );
  return requestedEmploymentIds;
}

const teamMemberResponse =
  (type: 'employee' | 'contractor' = 'employee') =>
  () =>
    HttpResponse.json({
      data: {
        employment: {
          id: timeOffRequestResponse.data.timeoff.employment_id,
          full_name: 'Jane Smith',
          type,
        },
      },
    });

function mockCompanyManagers(response: () => Response) {
  let requests = 0;
  server.use(
    http.get('*/v1/company-managers', () => {
      requests += 1;
      return response();
    }),
  );
  return () => requests;
}

const renderedDetails = (container: HTMLElement) =>
  [...container.querySelectorAll('.RemoteFlows__ReviewStep__Item')].map(
    (item) =>
      `${item.querySelector('dt')?.textContent}: ${item.querySelector('dd')?.textContent}`,
  );

function renderApproval(
  approveButtonProps: Partial<TimeOffApproveButtonProps> = {},
) {
  return render(
    <TimeOffFlow
      timeOffId='timeoff-123'
      render={({
        timeOffBag,
        components: { RequestIdStep, NextButton, ReviewStep, ApproveButton },
      }) =>
        timeOffBag.stepState.currentStep.name === 'request_id' ? (
          <>
            <RequestIdStep />
            <NextButton>Next</NextButton>
          </>
        ) : (
          <ReviewStep>
            <ApproveButton approverId={null} {...approveButtonProps}>
              Approve
            </ApproveButton>
          </ReviewStep>
        )
      }
    />,
    { wrapper: TestProviders },
  );
}

function mockApproval(...responses: Array<() => Response | Promise<Response>>) {
  const bodies: unknown[] = [];
  server.use(
    http.post('*/v1/timeoff/:id/approve', async ({ request }) => {
      bodies.push(await request.json());
      return responses[bodies.length - 1]();
    }),
  );
  return bodies;
}

function renderDecline(
  declineButtonProps: Partial<TimeOffDeclineButtonProps> = {},
  { withApproval = false } = {},
) {
  return render(
    <TimeOffFlow
      timeOffId='timeoff-123'
      render={({
        timeOffBag,
        components: {
          RequestIdStep,
          NextButton,
          ReviewStep,
          ApproveButton,
          DeclineButton,
        },
      }) =>
        timeOffBag.stepState.currentStep.name === 'request_id' ? (
          <>
            <RequestIdStep />
            <NextButton>Next</NextButton>
          </>
        ) : (
          <ReviewStep>
            {withApproval && (
              <ApproveButton approverId={null}>Approve</ApproveButton>
            )}
            <DeclineButton declineReason={null} {...declineButtonProps}>
              Decline
            </DeclineButton>
          </ReviewStep>
        )
      }
    />,
    { wrapper: TestProviders },
  );
}

function mockDecline(...responses: Array<() => Response | Promise<Response>>) {
  const bodies: unknown[] = [];
  server.use(
    http.post('*/v1/timeoff/:id/decline', async ({ request }) => {
      bodies.push(await request.json());
      return responses[bodies.length - 1]();
    }),
  );
  return bodies;
}

const decisionResponse =
  (timeoff: Partial<typeof timeOffRequestResponse.data.timeoff>) => () =>
    HttpResponse.json({
      data: {
        timeoff: { ...timeOffRequestResponse.data.timeoff, ...timeoff },
      },
    });

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

  it('shows the team member of the request under review', async () => {
    mockTimeOffRequest();
    const requestedEmploymentIds = mockTeamMember(teamMemberResponse());
    renderFlow('timeoff-123');

    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Team member')).toBeInTheDocument();
    expect(requestedEmploymentIds).toEqual([
      timeOffRequestResponse.data.timeoff.employment_id,
    ]);
  });

  const insertedAt = '2026-11-20T09:12:44Z';
  const coreDetails = [
    'Type: Paid time off',
    'Start date: Nov 16, 2026',
    'End date: Nov 17, 2026',
    'Duration: 16 hours',
    'Notes: Family trip',
  ];

  it.each([
    [
      'a requested request with no reasons, never edited, with no creator',
      { inserted_at: insertedAt, updated_at: insertedAt },
      [
        'Status: Requested',
        'Team member: Jane Smith',
        ...coreDetails,
        'Requested on: Nov 20, 2026',
      ],
    ],
    [
      'a declined request with its decline reason, edited by a company manager',
      {
        status: 'declined',
        decline_reason: 'Team is short-staffed that week',
        inserted_at: insertedAt,
        updated_at: '2026-11-22T15:03:10Z',
        created_by_id: 'manager-anne',
        edit_reason: "Dates moved at the employee's request",
      },
      [
        'Status: Declined',
        'Team member: Jane Smith',
        'Reason for decline: Team is short-staffed that week',
        ...coreDetails,
        'Requested on: Nov 20, 2026',
        'Last edited on: Nov 22, 2026',
        'Requested by: Anne White (Employer)',
        "Edit reason: Dates moved at the employee's request",
      ],
    ],
    [
      'an approved request with its approver and a declined cancellation',
      {
        status: 'approved',
        decline_reason: 'The handover is not done',
        cancel_reason: 'Trip cancelled',
        created_by_id: 'user-jane',
        approver_id: 'manager-anne',
        approved_at: '2026-11-21T10:00:00Z',
      },
      [
        'Status: Approved',
        'Team member: Jane Smith',
        ...coreDetails,
        'Requested by: Jane Smith (Employee)',
        'Approved by: Anne White',
        'Approved on: Nov 21, 2026',
        'Reason for declining cancellation: The handover is not done',
      ],
    ],
    [
      'a taken request approved by someone who is not a company manager',
      {
        status: 'taken',
        approver_id: 'user-remote',
        approved_at: '2026-11-21T10:00:00Z',
      },
      [
        'Status: Taken',
        'Team member: Jane Smith',
        ...coreDetails,
        'Approved on: Nov 21, 2026',
      ],
    ],
    [
      'a requested request with an approver',
      { approver_id: 'manager-anne', approved_at: '2026-11-21T10:00:00Z' },
      ['Status: Requested', 'Team member: Jane Smith', ...coreDetails],
    ],
    [
      'a cancelled request with its cancellation reason',
      {
        status: 'cancelled',
        cancel_reason: 'Trip cancelled',
        cancelled_at: '2026-11-21T10:00:00Z',
      },
      [
        'Status: Cancelled',
        'Team member: Jane Smith',
        'Cancelled on: Nov 21, 2026',
        ...coreDetails,
        'Cancellation reason: Trip cancelled',
      ],
    ],
  ] as const)('shows %s', async (_, timeoff, expectedDetails) => {
    mockTimeOffRequest(timeoff);
    mockTeamMember(teamMemberResponse());
    const { container } = renderFlow('timeoff-123');

    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(renderedDetails(container)).toEqual(expectedDetails);
    });
  });

  it.each([
    ['employee', 'Jane Smith (Employee)'],
    ['contractor', 'Jane Smith (Contractor)'],
  ] as const)(
    'shows a request the team member entered on an %s employment',
    async (type, creator) => {
      mockTimeOffRequest({ created_by_id: 'user-jane' });
      mockTeamMember(teamMemberResponse(type));
      renderFlow('timeoff-123');

      fireEvent.click(await screen.findByRole('button', { name: 'Next' }));

      expect(await screen.findByText(creator)).toBeInTheDocument();
      expect(screen.getByText('Requested by')).toBeInTheDocument();
    },
  );

  it('still reviews and decides on the request when its names fail to load', async () => {
    mockTimeOffRequest({
      created_by_id: 'manager-anne',
      status: 'approved',
      approver_id: 'manager-anne',
    });
    const requestedEmploymentIds = mockTeamMember(() =>
      HttpResponse.json({ message: 'Forbidden' }, { status: 403 }),
    );
    const companyManagerRequests = mockCompanyManagers(() =>
      HttpResponse.json({ message: 'Not Found' }, { status: 404 }),
    );
    renderApproval();

    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Paid time off')).toBeInTheDocument();
    await waitFor(() => {
      expect(requestedEmploymentIds).toHaveLength(1);
    });
    await waitFor(() => {
      expect(companyManagerRequests()).toBe(1);
    });
    expect(screen.queryByText('Team member')).not.toBeInTheDocument();
    expect(screen.queryByText('Requested by')).not.toBeInTheDocument();
    expect(screen.queryByText('Approved by')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled();
  });

  it('loads the company managers once per RemoteFlows mount', async () => {
    mockTimeOffRequest({ status: 'approved', approver_id: 'manager-anne' });
    mockTeamMember(teamMemberResponse());
    const managerNames: Record<string, string> = {
      'Bearer company-a-token': 'Anne White',
      'Bearer company-b-token': 'Ben Black',
    };
    const companyManagerAuthorizations: string[] = [];
    server.use(
      http.get('*/v1/company-managers', ({ request }) => {
        const authorization = request.headers.get('Authorization') ?? '';
        companyManagerAuthorizations.push(authorization);
        return HttpResponse.json({
          data: {
            ...companyManagersResponse.data,
            company_managers: [
              {
                ...companyManagersResponse.data.company_managers[0],
                user_name: managerNames[authorization],
              },
            ],
          },
        });
      }),
    );
    const remoteFlowsWith =
      (accessToken: string) =>
      ({ children }: PropsWithChildren) => (
        <RemoteFlows
          auth={() => Promise.resolve({ accessToken, expiresIn: 3600 })}
          components={defaultComponents}
          proxy={{ url: 'http://localhost:3000' }}
        >
          {children}
        </RemoteFlows>
      );

    const firstMount = renderFlow(
      'timeoff-123',
      {},
      remoteFlowsWith('company-a-token'),
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Anne White')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Anne White')).toBeInTheDocument();
    firstMount.unmount();

    renderFlow('timeoff-123', {}, remoteFlowsWith('company-b-token'));
    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Ben Black')).toBeInTheDocument();
    expect(companyManagerAuthorizations).toEqual([
      'Bearer company-a-token',
      'Bearer company-b-token',
    ]);
  });

  it('lets the consumer render the request details', async () => {
    mockTimeOffRequest({
      status: 'approved',
      created_by_id: 'manager-anne',
      approver_id: 'manager-anne',
    });
    mockTeamMember(teamMemberResponse());
    renderFlow('timeoff-123', {
      render: ({
        timeOffRequest,
        teamMemberName,
        createdBy,
        approverName,
        details,
      }) => (
        <ul>
          <li>{timeOffRequest.timezone}</li>
          <li>Team member: {teamMemberName}</li>
          <li>
            Creator: {createdBy?.name}, {createdBy?.role}
          </li>
          <li>Approver: {approverName}</li>
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
    expect(screen.getByText('status: Approved')).toBeInTheDocument();
    expect(
      await screen.findByText('Team member: Jane Smith'),
    ).toBeInTheDocument();
    expect(screen.getByText('team_member: Jane Smith')).toBeInTheDocument();
    expect(
      await screen.findByText('Creator: Anne White, Employer'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('created_by: Anne White (Employer)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Approver: Anne White')).toBeInTheDocument();
    expect(screen.getByText('approved_by: Anne White')).toBeInTheDocument();
    expect(screen.queryByText('Status')).not.toBeInTheDocument();
  });

  it.each([
    ['approved', 'Approved'],
    ['taken', 'Taken'],
  ] as const)(
    'approves the request and shows the %s status the API answers with',
    async (status, label) => {
      mockTimeOffRequest();
      const bodies = mockApproval(decisionResponse({ status }));
      const onSuccess = vi.fn();
      renderApproval({ onSuccess });

      fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));

      expect(await screen.findByText(label)).toBeInTheDocument();
      expect(onSuccess).toHaveBeenCalledWith({
        ...timeOffRequestResponse.data.timeoff,
        status,
      });
      expect(bodies).toEqual([{ approver_id: null }]);
    },
  );

  it('sends one approval for repeated clicks and the given approver', async () => {
    mockTimeOffRequest();
    let respond: (response: Response) => void = () => {};
    const bodies = mockApproval(
      () =>
        new Promise<Response>((resolve) => {
          respond = resolve;
        }),
    );
    renderApproval({ approverId: 'manager-1' });

    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    const approve = await screen.findByRole('button', { name: 'Approve' });
    fireEvent.click(approve);
    fireEvent.click(approve);

    await waitFor(() => expect(approve).toBeDisabled());
    fireEvent.click(approve);
    respond(decisionResponse({ status: 'approved' })());

    expect(await screen.findByText('Approved')).toBeInTheDocument();
    expect(bodies).toEqual([{ approver_id: 'manager-1' }]);
  });

  it.each([
    ['documented', timeOffErrorResponse],
    ['nested under error', { error: timeOffErrorResponse }],
  ])(
    'reports a 422 approval %s as rejected and lets the user approve again',
    async (_, body) => {
      mockTimeOffRequest();
      const bodies = mockApproval(
        () => HttpResponse.json(body, { status: 422 }),
        decisionResponse({ status: 'approved' }),
      );
      const onError = vi.fn();
      const onSuccess = vi.fn();
      renderApproval({ onError, onSuccess });

      fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
      const approve = await screen.findByRole('button', { name: 'Approve' });
      fireEvent.click(approve);

      await waitFor(() =>
        expect(onError).toHaveBeenCalledWith({
          reason: 'rejected',
          status: 422,
          message: timeOffErrorResponse.message,
          fieldErrors: timeOffErrorResponse.field_errors,
        }),
      );
      expect(screen.getByText('Requested')).toBeInTheDocument();
      await waitFor(() => expect(approve).toBeEnabled());

      fireEvent.click(approve);

      expect(await screen.findByText('Approved')).toBeInTheDocument();
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(bodies).toHaveLength(2);
    },
  );

  it.each([
    [404, 'not_found', { error: { message: 'Not Found' } }, 'Not Found'],
    [401, 'unauthorized', { message: 'Unauthorized' }, 'Unauthorized'],
    [
      429,
      'request_failed',
      { message: 'Too Many Requests' },
      'Too Many Requests',
    ],
  ])(
    'reports a %i approval response as %s',
    async (status, reason, body, message) => {
      mockTimeOffRequest();
      mockApproval(() => HttpResponse.json(body, { status }));
      const onError = vi.fn();
      renderApproval({ onError });

      fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));

      await waitFor(() =>
        expect(onError).toHaveBeenCalledWith({
          reason,
          status,
          message,
          fieldErrors: [],
        }),
      );
    },
  );

  it.each([
    ['declined', 'Declined', {}],
    [
      'approved',
      'Approved',
      { timeoff_type: 'public_holiday', automatic: true },
    ],
  ] as const)(
    'declines the request and shows the %s status the API answers with',
    async (status, label, timeoff) => {
      mockTimeOffRequest(timeoff);
      const bodies = mockDecline(decisionResponse({ ...timeoff, status }));
      const onSuccess = vi.fn();
      renderDecline({ onSuccess });

      fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Decline' }));

      expect(await screen.findByText(label)).toBeInTheDocument();
      expect(onSuccess).toHaveBeenCalledWith({
        ...timeOffRequestResponse.data.timeoff,
        ...timeoff,
        status,
      });
      expect(bodies).toEqual([{ decline_reason: null }]);
    },
  );

  it('sends one decline for repeated clicks and the given reason', async () => {
    mockTimeOffRequest();
    let respond: (response: Response) => void = () => {};
    const bodies = mockDecline(
      () =>
        new Promise<Response>((resolve) => {
          respond = resolve;
        }),
    );
    renderDecline({ declineReason: 'Business purposes' });

    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    const decline = await screen.findByRole('button', { name: 'Decline' });
    fireEvent.click(decline);
    fireEvent.click(decline);

    await waitFor(() => expect(decline).toBeDisabled());
    fireEvent.click(decline);
    respond(decisionResponse({ status: 'declined' })());

    expect(await screen.findByText('Declined')).toBeInTheDocument();
    expect(bodies).toEqual([{ decline_reason: 'Business purposes' }]);
  });

  it('shows the decline reason the decline answers with, without loading the request again', async () => {
    const requestedIds = mockTimeOffRequest();
    mockDecline(
      decisionResponse({
        status: 'declined',
        decline_reason: 'Overlaps with the release',
      }),
    );
    const { container } = renderDecline({
      declineReason: 'Overlaps with the release',
    });

    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Decline' }));

    await waitFor(() => {
      expect(renderedDetails(container)).toContain(
        'Reason for decline: Overlaps with the release',
      );
    });
    expect(requestedIds).toEqual(['timeoff-123']);
  });

  it('disables approval while a decline is being sent', async () => {
    mockTimeOffRequest();
    let respond: (response: Response) => void = () => {};
    mockDecline(
      () =>
        new Promise<Response>((resolve) => {
          respond = resolve;
        }),
    );
    renderDecline({}, { withApproval: true });

    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    const approve = await screen.findByRole('button', { name: 'Approve' });
    fireEvent.click(screen.getByRole('button', { name: 'Decline' }));

    await waitFor(() => expect(approve).toBeDisabled());
    respond(decisionResponse({ status: 'declined' })());

    expect(await screen.findByText('Declined')).toBeInTheDocument();
    await waitFor(() => expect(approve).toBeEnabled());
  });

  it.each([
    ['documented', declineReasonErrorResponse],
    ['nested under error', { error: declineReasonErrorResponse }],
  ])(
    'reports a 422 decline %s as rejected and lets the user decline again',
    async (_, body) => {
      mockTimeOffRequest();
      const bodies = mockDecline(
        () => HttpResponse.json(body, { status: 422 }),
        decisionResponse({ status: 'declined' }),
      );
      const onError = vi.fn();
      const onSuccess = vi.fn();
      renderDecline({ onError, onSuccess });

      fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
      const decline = await screen.findByRole('button', { name: 'Decline' });
      fireEvent.click(decline);

      await waitFor(() =>
        expect(onError).toHaveBeenCalledWith({
          reason: 'rejected',
          status: 422,
          message: declineReasonErrorResponse.message,
          fieldErrors: declineReasonErrorResponse.field_errors,
        }),
      );
      expect(screen.getByText('Requested')).toBeInTheDocument();
      await waitFor(() => expect(decline).toBeEnabled());

      fireEvent.click(decline);

      expect(await screen.findByText('Declined')).toBeInTheDocument();
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(bodies).toHaveLength(2);
    },
  );

  it.each([
    [404, 'not_found', { error: { message: 'Not Found' } }, 'Not Found'],
    [401, 'unauthorized', { message: 'Unauthorized' }, 'Unauthorized'],
    [
      429,
      'request_failed',
      { message: 'Too Many Requests' },
      'Too Many Requests',
    ],
  ])(
    'reports a %i decline response as %s',
    async (status, reason, body, message) => {
      mockTimeOffRequest();
      mockDecline(() => HttpResponse.json(body, { status }));
      const onError = vi.fn();
      renderDecline({ onError });

      fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Decline' }));

      await waitFor(() =>
        expect(onError).toHaveBeenCalledWith({
          reason,
          status,
          message,
          fieldErrors: [],
        }),
      );
    },
  );
});
