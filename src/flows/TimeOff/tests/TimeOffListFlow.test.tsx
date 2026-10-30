import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { TimeOffListFlow } from '@/src/index';
import {
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

describe('TimeOffListFlow', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('lists requested time off first, then pages and filters by status', async () => {
    const queries = mockTimeOffRequests();
    renderFlow();

    expect(screen.getByText('Loading time-off requests')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /requested leave, page 1/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(
      await screen.findByRole('button', { name: /requested leave, page 2/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await fillSelect('Status', 'approved');

    expect(
      await screen.findByRole('button', { name: /approved leave, page 1/ }),
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

    await screen.findByRole('button', { name: /requested leave, page 1/ });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(
      await screen.findByRole('button', { name: /requested leave, page 2/ }),
    );

    expect(await screen.findByText('Reviewed leave')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(
      await screen.findByRole('button', { name: /requested leave, page 2/ }),
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

    fireEvent.click(
      await screen.findByRole('button', { name: /requested leave, page 1/ }),
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));

    expect(await screen.findByText('Approved')).toBeInTheDocument();
    await waitFor(() => {
      expect(queries).toEqual(['?status=requested', '?status=requested']);
    });
    expect(requestedIds).toEqual(['timeoff-1']);
    expect(approvedIds).toEqual(['timeoff-1']);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(
      await screen.findByRole('button', { name: /requested leave, page 1/ }),
    ).toBeInTheDocument();
  });
});
