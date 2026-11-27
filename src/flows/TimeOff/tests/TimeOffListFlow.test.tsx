import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { TimeOffListFlow, useTimeOffList } from '@/src/index';
import {
  companyManagersResponse,
  emptyTimeOffRequestsResponse,
  timeOffRequestResponse,
  timeOffRequestsResponse,
} from '@/src/flows/TimeOff/tests/fixtures';
import { server } from '@/src/tests/server';
import {
  fillSelect,
  queryClient,
  TestProviders,
} from '@/src/tests/testHelpers';

function renderFlow() {
  return render(
    <TimeOffListFlow
      render={({
        timeOffListBag,
        components: {
          StatusFilter,
          ListStep,
          ListRetryButton,
          PreviousPageButton,
          NextPageButton,
          ReviewStep,
          BackButton,
          ApproveButton,
        },
      }) =>
        timeOffListBag.stepState.currentStep.name === 'list' ? (
          <>
            <StatusFilter />
            {timeOffListBag.isLoadingTimeOffRequests && (
              <p>Loading time-off requests</p>
            )}
            {timeOffListBag.isEmpty && <p>No time-off requests</p>}
            {timeOffListBag.timeOffRequestsError && (
              <>
                <p role='alert'>{timeOffListBag.timeOffRequestsError.reason}</p>
                <ListRetryButton>Try again</ListRetryButton>
              </>
            )}
            <ListStep />
            <PreviousPageButton>Previous</PreviousPageButton>
            <NextPageButton>Next</NextPageButton>
          </>
        ) : (
          <>
            <ReviewStep>
              <ApproveButton approverId={null}>Approve</ApproveButton>
            </ReviewStep>
            <BackButton>Back</BackButton>
          </>
        )
      }
    />,
    { wrapper: TestProviders },
  );
}

const listedTimeOff = (id: string, leavePolicyName: string) => ({
  ...timeOffRequestResponse.data.timeoff,
  id,
  leave_policy: {
    ...timeOffRequestResponse.data.timeoff.leave_policy,
    name: leavePolicyName,
  },
});

function mockTimeOffRequests() {
  const queries: string[] = [];
  server.use(
    http.get('*/v1/timeoff', ({ request }) => {
      const { search, searchParams } = new URL(request.url);
      queries.push(search);
      const page = Number(searchParams.get('page') ?? 1);
      return HttpResponse.json({
        data: {
          ...timeOffRequestsResponse.data,
          current_page: page,
          timeoffs: [
            listedTimeOff(
              `timeoff-${page}`,
              `${searchParams.get('status')} leave, page ${page}`,
            ),
          ],
        },
      });
    }),
  );
  return queries;
}

function mockTimeOffRequest() {
  const requestedIds: string[] = [];
  server.use(
    http.get('*/v1/timeoff/:id', ({ params }) => {
      requestedIds.push(params.id as string);
      return HttpResponse.json({
        data: {
          timeoff: listedTimeOff(params.id as string, 'Reviewed leave'),
        },
      });
    }),
  );
  return requestedIds;
}

const employmentId = timeOffRequestResponse.data.timeoff.employment_id;

function mockTeamMembers(fullNames: Record<string, string>) {
  const requestedEmploymentIds: string[] = [];
  server.use(
    http.get('*/v1/employments/:id', ({ params }) => {
      const id = params.id as string;
      requestedEmploymentIds.push(id);
      return fullNames[id]
        ? HttpResponse.json({
            data: { employment: { id, full_name: fullNames[id] } },
          })
        : HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
    }),
  );
  return requestedEmploymentIds;
}

describe('TimeOffListFlow', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('lists requested time off first, then pages and filters by status', async () => {
    const queries = mockTimeOffRequests();
    renderFlow();

    expect(screen.getByText('Loading time-off requests')).toBeInTheDocument();
    expect(
      await screen.findByText('requested leave, page 1'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(
      await screen.findByText('requested leave, page 2'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await fillSelect('Status', 'approved');

    expect(
      await screen.findByText('approved leave, page 1'),
    ).toBeInTheDocument();
    expect(queries).toEqual([
      '?status=requested',
      '?status=requested&page=2',
      '?status=approved',
    ]);
  });

  it('tells a failed page apart from an empty one and retries it', async () => {
    let attempts = 0;
    server.use(
      http.get('*/v1/timeoff', () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json({ message: 'Unavailable' }, { status: 503 })
          : HttpResponse.json(emptyTimeOffRequestsResponse);
      }),
    );
    renderFlow();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'request_failed',
    );
    expect(screen.queryByText('No time-off requests')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('No time-off requests')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('reviews a listed request and returns to the same page of the list', async () => {
    const queries = mockTimeOffRequests();
    const requestedIds = mockTimeOffRequest();
    renderFlow();

    await screen.findByText('requested leave, page 1');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('requested leave, page 2');
    fireEvent.click(screen.getByRole('button', { name: /^View/ }));

    expect(await screen.findByText('Reviewed leave')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(
      await screen.findByText('requested leave, page 2'),
    ).toBeInTheDocument();
    expect(requestedIds).toEqual(['timeoff-2']);
    expect(queries).toEqual(['?status=requested', '?status=requested&page=2']);
  });

  it('refreshes the list after approving a listed request, without loading the request again', async () => {
    const queries = mockTimeOffRequests();
    const requestedIds = mockTimeOffRequest();
    const approvedIds: string[] = [];
    server.use(
      http.post('*/v1/timeoff/:id/approve', ({ params }) => {
        approvedIds.push(params.id as string);
        return HttpResponse.json({
          data: {
            timeoff: {
              ...listedTimeOff(params.id as string, 'Reviewed leave'),
              status: 'approved',
            },
          },
        });
      }),
    );
    renderFlow();

    await screen.findByText('requested leave, page 1');
    fireEvent.click(screen.getByRole('button', { name: /^View/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));

    expect(await screen.findByText('Approved')).toBeInTheDocument();
    await waitFor(() => {
      expect(queries).toEqual(['?status=requested', '?status=requested']);
    });
    expect(requestedIds).toEqual(['timeoff-1']);
    expect(approvedIds).toEqual(['timeoff-1']);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(
      await screen.findByText('requested leave, page 1'),
    ).toBeInTheDocument();
  });

  it('moves back to the last page when a decision empties the page under review', async () => {
    let totalPages = 2;
    const queries: string[] = [];
    server.use(
      http.get('*/v1/timeoff', ({ request }) => {
        const { search, searchParams } = new URL(request.url);
        queries.push(search);
        const page = Number(searchParams.get('page') ?? 1);
        return HttpResponse.json({
          data: {
            ...timeOffRequestsResponse.data,
            current_page: page,
            total_pages: totalPages,
            timeoffs:
              page > totalPages
                ? []
                : [listedTimeOff(`timeoff-${page}`, `Leave, page ${page}`)],
          },
        });
      }),
      http.post('*/v1/timeoff/:id/approve', ({ params }) => {
        totalPages = 1;
        return HttpResponse.json({
          data: {
            timeoff: {
              ...listedTimeOff(params.id as string, 'Reviewed leave'),
              status: 'approved',
            },
          },
        });
      }),
    );
    mockTimeOffRequest();
    renderFlow();

    await screen.findByText('Leave, page 1');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Leave, page 2');
    fireEvent.click(screen.getByRole('button', { name: /^View/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));
    expect(await screen.findByText('Approved')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByText('Leave, page 1')).toBeInTheDocument();
    expect(screen.queryByText('No time-off requests')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(queries).toEqual([
      '?status=requested',
      '?status=requested&page=2',
      '?status=requested&page=2',
      '?status=requested&page=1',
    ]);
  });

  it('ends each listed request with View, Decline and Approve, deciding on that request without opening it', async () => {
    const queries = mockTimeOffRequests();
    const requestedIds = mockTimeOffRequest();
    const approvals: { id: string; body: unknown }[] = [];
    server.use(
      http.post('*/v1/timeoff/:id/approve', async ({ params, request }) => {
        approvals.push({ id: params.id as string, body: await request.json() });
        return HttpResponse.json({
          data: {
            timeoff: {
              ...listedTimeOff(params.id as string, 'Approved leave'),
              status: 'approved',
            },
          },
        });
      }),
    );
    renderFlow();

    await screen.findByText('requested leave, page 1');
    expect(
      screen.queryByRole('button', { name: /^requested leave/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Decline/ })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: /^Approve/ }));

    await waitFor(() => {
      expect(queries).toEqual(['?status=requested', '?status=requested']);
    });
    expect(approvals).toEqual([
      { id: 'timeoff-1', body: { approver_id: null } },
    ]);
    expect(requestedIds).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: /^View/ }));

    expect(await screen.findByText('Reviewed leave')).toBeInTheDocument();
    expect(requestedIds).toEqual(['timeoff-1']);
  });

  it('shows the team member of each listed request once their employment loads', async () => {
    mockTimeOffRequests();
    let respond: (response: Response) => void = () => {};
    server.use(
      http.get(
        '*/v1/employments/:id',
        () =>
          new Promise<Response>((resolve) => {
            respond = resolve;
          }),
      ),
    );
    render(
      <TimeOffListFlow
        render={({ components: { ListStep } }) => (
          <ListStep
            render={({ listedDetails }) =>
              listedDetails
                .map(({ label, value }) => `${label}: ${value}`)
                .join(' | ')
            }
          />
        )}
      />,
      { wrapper: TestProviders },
    );

    expect(
      await screen.findByText(
        'Type: requested leave, page 1 | Status: Requested | Start date: Nov 16, 2026 | End date: Nov 17, 2026 | Duration: 16 hours',
      ),
    ).toBeInTheDocument();

    respond(
      HttpResponse.json({
        data: { employment: { id: employmentId, full_name: 'Jane Smith' } },
      }),
    );

    expect(
      await screen.findByText(
        'Team member: Jane Smith | Type: requested leave, page 1 | Status: Requested | Start date: Nov 16, 2026 | End date: Nov 17, 2026 | Duration: 16 hours',
      ),
    ).toBeInTheDocument();
  });

  it('loads each employment and the company managers once, also when reviewing a listed request', async () => {
    server.use(
      http.get('*/v1/timeoff', () =>
        HttpResponse.json({
          data: {
            ...timeOffRequestsResponse.data,
            timeoffs: [
              listedTimeOff('timeoff-1', 'Paid leave'),
              listedTimeOff('timeoff-2', 'Sick leave'),
              {
                ...listedTimeOff('timeoff-3', 'Unpaid leave'),
                employment_id: 'employment-2',
              },
            ],
          },
        }),
      ),
    );
    mockTimeOffRequest();
    let companyManagerRequests = 0;
    server.use(
      http.get('*/v1/company-managers', () => {
        companyManagerRequests += 1;
        return HttpResponse.json(companyManagersResponse);
      }),
    );
    const requestedEmploymentIds = mockTeamMembers({
      [employmentId]: 'Jane Smith',
      'employment-2': 'John Doe',
    });
    const { container } = renderFlow();

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(
      [
        ...container.querySelectorAll(
          '.RemoteFlows__ListStep__Value__team_member',
        ),
      ].map((value) => value.textContent),
    ).toEqual(['Jane Smith', 'Jane Smith', 'John Doe']);

    fireEvent.click(screen.getAllByRole('button', { name: /^View/ })[0]);
    expect(await screen.findByText('Reviewed leave')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByText('John Doe')).toBeInTheDocument();

    expect(requestedEmploymentIds).toHaveLength(2);
    expect(new Set(requestedEmploymentIds)).toEqual(
      new Set([employmentId, 'employment-2']),
    );
    expect(companyManagerRequests).toBe(1);
  });

  it('still lists and decides on requests whose team member fails to load', async () => {
    server.use(
      http.get('*/v1/timeoff', () =>
        HttpResponse.json({
          data: {
            ...timeOffRequestsResponse.data,
            timeoffs: [
              listedTimeOff('timeoff-1', 'Paid leave'),
              {
                ...listedTimeOff('timeoff-2', 'Sick leave'),
                employment_id: 'employment-2',
              },
            ],
          },
        }),
      ),
    );
    const requestedEmploymentIds = mockTeamMembers({
      'employment-2': 'Anne White',
    });
    renderFlow();

    expect(await screen.findByText('Anne White')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Approve Paid leave, Requested, Nov 16, 2026, Nov 17, 2026, 16 hours',
      }),
    ).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(requestedEmploymentIds).toHaveLength(2);
    expect(new Set(requestedEmploymentIds)).toEqual(
      new Set([employmentId, 'employment-2']),
    );
  });

  it('names each listed action after its request', async () => {
    mockTeamMembers({ [employmentId]: 'Jane Smith' });
    server.use(
      http.get('*/v1/timeoff', () =>
        HttpResponse.json({
          data: {
            ...timeOffRequestsResponse.data,
            timeoffs: [
              listedTimeOff('timeoff-1', 'Paid leave'),
              listedTimeOff('timeoff-2', 'Sick leave'),
            ],
          },
        }),
      ),
    );
    renderFlow();

    await screen.findByText('Sick leave');
    await screen.findAllByText('Jane Smith');

    expect(
      within(screen.getByRole('list'))
        .getAllByRole('button')
        .map((button) => button.getAttribute('aria-label')),
    ).toEqual([
      'View Jane Smith, Paid leave, Requested, Nov 16, 2026, Nov 17, 2026, 16 hours',
      'Decline Jane Smith, Paid leave, Requested, Nov 16, 2026, Nov 17, 2026, 16 hours',
      'Approve Jane Smith, Paid leave, Requested, Nov 16, 2026, Nov 17, 2026, 16 hours',
      'View Jane Smith, Sick leave, Requested, Nov 16, 2026, Nov 17, 2026, 16 hours',
      'Decline Jane Smith, Sick leave, Requested, Nov 16, 2026, Nov 17, 2026, 16 hours',
      'Approve Jane Smith, Sick leave, Requested, Nov 16, 2026, Nov 17, 2026, 16 hours',
    ]);
  });

  it('renders the actions a partner gives each listed request', async () => {
    mockTimeOffRequests();
    const declines: { id: string; body: unknown }[] = [];
    server.use(
      http.post('*/v1/timeoff/:id/decline', async ({ params, request }) => {
        declines.push({ id: params.id as string, body: await request.json() });
        return HttpResponse.json({
          data: {
            timeoff: {
              ...listedTimeOff(params.id as string, 'Declined leave'),
              status: 'declined',
            },
          },
        });
      }),
    );
    const onSuccess = vi.fn();
    render(
      <TimeOffListFlow
        render={({ components: { ListStep, DeclineButton } }) => (
          <ListStep
            renderActions={({ timeOffRequest }) => (
              <DeclineButton
                declineReason={`Overlaps for ${timeOffRequest.id}`}
                onSuccess={onSuccess}
              >
                Reject
              </DeclineButton>
            )}
          />
        )}
      />,
      { wrapper: TestProviders },
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Reject' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        ...listedTimeOff('timeoff-1', 'Declined leave'),
        status: 'declined',
      });
    });
    expect(declines).toEqual([
      { id: 'timeoff-1', body: { decline_reason: 'Overlaps for timeoff-1' } },
    ]);
    expect(
      screen.queryByRole('button', { name: /^View/ }),
    ).not.toBeInTheDocument();
  });

  it('renders only the markup a partner gives each listed request', async () => {
    const approvedIds: string[] = [];
    mockTeamMembers({ [employmentId]: 'Jane Smith' });
    server.use(
      http.get('*/v1/timeoff', () =>
        HttpResponse.json({
          data: {
            ...timeOffRequestsResponse.data,
            timeoffs: [
              listedTimeOff('timeoff-1', 'Paid leave'),
              {
                ...listedTimeOff('timeoff-2', 'Sick leave'),
                status: 'approved',
              },
            ],
          },
        }),
      ),
      http.post('*/v1/timeoff/:id/approve', ({ params }) => {
        approvedIds.push(params.id as string);
        return HttpResponse.json({
          data: {
            timeoff: {
              ...listedTimeOff(params.id as string, 'Paid leave'),
              status: 'approved',
            },
          },
        });
      }),
    );
    render(
      <TimeOffListFlow
        render={({ components: { ListStep, ApproveButton } }) => (
          <table>
            <tbody>
              <ListStep
                renderItem={({ timeOffRequest, teamMemberName, canDecide }) => (
                  <tr>
                    <td>{teamMemberName}</td>
                    <td>{timeOffRequest.leave_policy.name}</td>
                    <td>
                      {canDecide && <ApproveButton approverId='manager-1' />}
                    </td>
                  </tr>
                )}
              />
            </tbody>
          </table>
        )}
      />,
      { wrapper: TestProviders },
    );

    expect(
      await screen.findByRole('cell', { name: 'Sick leave' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Paid leave' }),
    ).toBeInTheDocument();
    expect(
      await screen.findAllByRole('cell', { name: 'Jane Smith' }),
    ).toHaveLength(2);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => {
      expect(approvedIds).toEqual(['timeoff-1']);
    });
  });

  it('lists the first page again when the status filter is cleared', async () => {
    mockTimeOffRequests();
    const { result } = renderHook(() => useTimeOffList(), {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(1);
    });
    act(() => {
      result.current.nextPage();
    });
    await waitFor(() => {
      expect(result.current.currentPage).toBe(2);
    });

    await act(async () => {
      await result.current.checkFieldUpdates({ status: undefined });
    });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(1);
    });
    expect(result.current.status).toBe('requested');
  });
});
