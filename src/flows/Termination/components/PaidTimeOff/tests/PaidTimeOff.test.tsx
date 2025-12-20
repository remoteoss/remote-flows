import { render, screen, waitFor } from '@testing-library/react';
import { PaidTimeOffContainer } from '@/src/flows/Termination/components/PaidTimeOff/PaidTimeOffContainer';
import { server } from '@/src/tests/server';
import { http, HttpResponse } from 'msw';
import {
  approvedTimeoffs,
  timeoffLeavePoliciesSummaryResponse,
} from '@/src/flows/Termination/tests/fixtures';
import { employment } from '@/src/tests/fixtures';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

describe('PaidTimeOff', () => {
  const originalTimezone = process.env.TZ;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    server.use(
      http.get('*/v1/timeoff*', () => {
        return HttpResponse.json(approvedTimeoffs);
      }),
      http.get('*/v1/leave-policies/summary/*', () => {
        return HttpResponse.json(timeoffLeavePoliciesSummaryResponse);
      }),
    );
  });

  afterEach(() => {
    process.env.TZ = originalTimezone;
  });

  it('should render the PaidTimeOff component with summary data', async () => {
    render(
      <PaidTimeOffContainer
        employmentId='test-id'
        employeeName='John Doe'
        proposedTerminationDate='2025-12-15'
        render={(props) => {
          return (
            <div>
              <h3>Paid time off</h3>
              <p>Employee: {props.employeeName}</p>
              {props.summaryData?.isLoading && <div>Loading...</div>}
              {props.summaryData?.isError && <div>Error loading data</div>}
              {!props.summaryData?.isLoading && !props.summaryData?.isError && (
                <div data-testid='summary-data'>
                  <p>Entitled: {props.summaryData?.data?.entitledDays} days</p>
                  <p>
                    Current Entitlement:{' '}
                    {props.summaryData?.data?.currentEntitlementDays} days
                  </p>
                  <p>Booked: {props.summaryData?.data?.bookedDays} days</p>
                  <p>Used: {props.summaryData?.data?.usedDays} days</p>
                  <p>
                    Approved before termination:{' '}
                    {props.summaryData?.data?.approvedDaysBeforeTermination}{' '}
                    days
                  </p>
                  <p>
                    Approved after termination:{' '}
                    {props.summaryData?.data?.approvedDaysAfterTermination} days
                  </p>
                  <p>
                    Remaining: {props.summaryData?.data?.remainingDays} days
                  </p>
                </div>
              )}
            </div>
          );
        }}
      />,
      { wrapper: TestProviders },
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByTestId('summary-data')).toBeInTheDocument();
    });

    const summaryData = screen.getByTestId('summary-data');
    expect(summaryData).toHaveTextContent(
      `Entitled: ${timeoffLeavePoliciesSummaryResponse.data[0].annual_entitlement.days} days`,
    );
    expect(summaryData).toHaveTextContent(
      `Current Entitlement: ${timeoffLeavePoliciesSummaryResponse.data[0].current_entitlement.days} days`,
    );
    expect(summaryData).toHaveTextContent('Booked: 4 days');
    expect(summaryData).toHaveTextContent('Used: 3 days');
    expect(summaryData).toHaveTextContent(
      'Approved before termination: 2 days',
    );
    expect(summaryData).toHaveTextContent(
      'Approved after termination: 2.5 days',
    );
    expect(summaryData).toHaveTextContent('Remaining: 16 days');
  });

  it('should render the PaidTimeOff component with unlimited PTO', async () => {
    server.use(
      http.get('*/v1/leave-policies/summary/*', () => {
        return HttpResponse.json({
          data: [
            {
              ...timeoffLeavePoliciesSummaryResponse.data[0],
              annual_entitlement: {
                type: 'unlimited',
                // Note: hours and days are not sent when type is 'unlimited'
              },
              current_entitlement: {
                type: 'unlimited',
                // Note: hours and days are not sent when type is 'unlimited'
              },
            },
          ],
        });
      }),
    );

    render(
      <PaidTimeOffContainer
        employment={employment.data.employment as $TSFixMe}
        employmentId='test-id'
        employeeName='Jane Smith'
        proposedTerminationDate='2025-12-15'
        render={(props) => {
          return (
            <div>
              <h3>Paid time off - Unlimited</h3>
              <p>Employee: {props.employeeName}</p>
              {props.summaryData?.isLoading && <div>Loading...</div>}
              {props.summaryData?.isError && <div>Error loading data</div>}
              {!props.summaryData?.isLoading && !props.summaryData?.isError && (
                <div data-testid='unlimited-summary-data'>
                  <p>
                    Is Unlimited:{' '}
                    {props.summaryData?.data?.isUnlimitedPto ? 'Yes' : 'No'}
                  </p>
                  <p>Entitled: {props.summaryData?.data?.entitledDays}</p>
                  <p>
                    Current Entitlement:{' '}
                    {props.summaryData?.data?.currentEntitlementDays}
                  </p>
                  <p>Booked: {props.summaryData?.data?.bookedDays}</p>
                  <p>Used: {props.summaryData?.data?.usedDays}</p>
                  <p>
                    Approved before termination:{' '}
                    {props.summaryData?.data?.approvedDaysBeforeTermination}
                  </p>
                  <p>
                    Approved after termination:{' '}
                    {props.summaryData?.data?.approvedDaysAfterTermination}
                  </p>
                  <p>Remaining: {props.summaryData?.data?.remainingDays}</p>
                </div>
              )}
            </div>
          );
        }}
      />,
      { wrapper: TestProviders },
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByTestId('unlimited-summary-data')).toBeInTheDocument();
    });

    const summaryData = screen.getByTestId('unlimited-summary-data');
    expect(summaryData).toHaveTextContent('Is Unlimited: Yes');
    expect(summaryData).toHaveTextContent(
      `Entitled: ${employment.data.employment.contract_details.available_pto} days`,
    );
    expect(summaryData).toHaveTextContent(
      `Current Entitlement: ${employment.data.employment.contract_details.available_pto} days`,
    );
    expect(summaryData).toHaveTextContent('Booked: 4 days');
    expect(summaryData).toHaveTextContent('Used: 3 days');
    expect(summaryData).toHaveTextContent(
      'Approved before termination: 2 days',
    );
    expect(summaryData).toHaveTextContent(
      'Approved after termination: 2.5 days',
    );
    // Remaining: 23 - 4 - 3 = 16 days
    expect(summaryData).toHaveTextContent('Remaining: 16 days');
  });

  it('should format dates correctly regardless of user timezone', async () => {
    // Test with USA Eastern Time (UTC-5)
    process.env.TZ = 'America/New_York';

    render(
      <PaidTimeOffContainer
        employmentId='test-id'
        employeeName='John Doe'
        proposedTerminationDate='2025-01-15'
        render={(props) => {
          return (
            <div>
              const{' '}
              <button
                onClick={() => {
                  props.onOpenChange();
                }}
              >
                View details
              </button>
              <p data-testid='formatted-date'>
                {props.formattedProposedTerminationDate}
              </p>
              {props.timeoffQuery?.data?.timeoffs?.map((timeoff, index) => (
                <p key={index} data-testid={`timeoff-${index}`}>
                  {timeoff.formattedDate}
                </p>
              ))}
            </div>
          );
        }}
      />,
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      expect(screen.getByTestId('formatted-date')).toBeInTheDocument();
    });

    // Date should be January 15, not January 14 (which would happen with UTC parsing)
    expect(screen.getByTestId('formatted-date')).toHaveTextContent(
      'January 15, 2025',
    );

    // Open the drawer to load timeoff data
    const openButton = screen.getByText(/View details/i);
    if (openButton) {
      openButton.click();
    }

    await waitFor(() => {
      expect(screen.queryAllByTestId(/^timeoff-/).length).toBeGreaterThan(0);
    });

    const timeoffElements = screen.queryAllByTestId(/^timeoff-/);

    expect(timeoffElements[0]).toHaveTextContent('Dec 14, 2025 → Dec 14, 2025');

    expect(timeoffElements[1]).toHaveTextContent('Dec 15, 2025 → Dec 15, 2025');

    expect(timeoffElements[2]).toHaveTextContent('Dec 16, 2025 → Dec 16, 2025');

    expect(timeoffElements[3]).toHaveTextContent('Dec 17, 2025 → Dec 17, 2025');
  });

  it('should calculate bookedDays excluding days with 0 hours (weekends/holidays)', async () => {
    // Mock timeoff data with multiple timeoffs, some with weekends/holidays
    const timeoffWithWeekends = {
      data: {
        total_count: 2,
        current_page: 1,
        total_pages: 1,
        timeoffs: [
          {
            id: 'test-timeoff-id-1',
            status: 'approved',
            start_date: '2025-12-22',
            end_date: '2026-01-02',
            timeoff_type: 'paid_time_off',
            timeoff_days: [
              { hours: 8, day: '2025-12-22' },
              { hours: 8, day: '2025-12-23' },
              { hours: 8, day: '2025-12-24' },
              { hours: 0, day: '2025-12-25' }, // holiday
              { hours: 8, day: '2025-12-26' },
              { hours: 0, day: '2025-12-27' }, // weekend
              { hours: 0, day: '2025-12-28' }, // weekend
              { hours: 8, day: '2025-12-29' },
              { hours: 8, day: '2025-12-30' },
              { hours: 8, day: '2025-12-31' },
              { hours: 0, day: '2026-01-01' }, // holiday
              { hours: 8, day: '2026-01-02' },
            ],
          },
          {
            id: 'test-timeoff-id-2',
            status: 'approved',
            start_date: '2025-10-21',
            end_date: '2025-10-22',
            timeoff_type: 'paid_time_off',
            timeoff_days: [
              { hours: 8, day: '2025-10-21' },
              { hours: 8, day: '2025-10-22' },
            ],
          },
        ],
      },
    };

    server.use(
      http.get('*/v1/timeoff*', () => {
        return HttpResponse.json(timeoffWithWeekends);
      }),
    );

    render(
      <PaidTimeOffContainer
        employmentId='test-id'
        employeeName='John Doe'
        proposedTerminationDate='2025-12-15'
        render={(props) => {
          return (
            <div>
              <button
                onClick={() => {
                  props.onOpenChange();
                }}
              >
                View details
              </button>
              <div data-testid='booked-days'>
                Booked Days: {props.timeoffQuery?.data?.bookedDays || 0}
              </div>
              {props.timeoffQuery?.data?.timeoffs?.map((timeoff, index) => (
                <div key={index} data-testid={`timeoff-${index}`}>
                  <span data-testid={`duration-${index}`}>
                    Duration: {timeoff.duration} days
                  </span>
                </div>
              ))}
            </div>
          );
        }}
      />,
      { wrapper: TestProviders },
    );

    // Open the drawer to load timeoff data
    const openButton = screen.getByText(/View details/i);
    openButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('booked-days')).toHaveTextContent(
        'Booked Days: 10',
      );
    });

    // Also verify individual durations
    expect(screen.getByTestId('duration-0')).toHaveTextContent(
      'Duration: 8 days',
    );
    expect(screen.getByTestId('duration-1')).toHaveTextContent(
      'Duration: 2 days',
    );
  });

  it('should calculate duration excluding days with 0 hours (weekends/holidays)', async () => {
    // Mock timeoff data with weekends and holidays (0 hours)
    const timeoffWithWeekends = {
      data: {
        total_count: 1,
        current_page: 1,
        total_pages: 1,
        timeoffs: [
          {
            id: 'test-timeoff-id',
            status: 'approved',
            automatic: false,
            timezone: 'Europe/Madrid',
            cancelled_at: null,
            start_date: '2025-12-22',
            employment_id: 'test-employment-id',
            cancel_reason: null,
            end_date: '2026-01-02',
            notes: null,
            approved_at: '2025-12-19T07:43:57Z',
            timeoff_type: 'paid_time_off',
            leave_policy: {
              name: 'Paid time off',
              leave_policy_variant_slug: 'paid_time_off',
              leave_type: 'paid_time_off',
            },
            timeoff_days: [
              { hours: 8, day: '2025-12-22' }, // Monday
              { hours: 8, day: '2025-12-23' }, // Tuesday
              { hours: 8, day: '2025-12-24' }, // Wednesday
              { hours: 0, day: '2025-12-25' }, // Thursday (holiday)
              { hours: 8, day: '2025-12-26' }, // Friday
              { hours: 0, day: '2025-12-27' }, // Saturday (weekend)
              { hours: 0, day: '2025-12-28' }, // Sunday (weekend)
              { hours: 8, day: '2025-12-29' }, // Monday
              { hours: 8, day: '2025-12-30' }, // Tuesday
              { hours: 8, day: '2025-12-31' }, // Wednesday
              { hours: 0, day: '2026-01-01' }, // Thursday (holiday)
              { hours: 8, day: '2026-01-02' }, // Friday
            ],
            approver_id: 'test-approver-id',
          },
        ],
      },
    };

    server.use(
      http.get('*/v1/timeoff*', () => {
        return HttpResponse.json(timeoffWithWeekends);
      }),
    );

    render(
      <PaidTimeOffContainer
        employmentId='test-id'
        employeeName='John Doe'
        proposedTerminationDate='2025-12-15'
        render={(props) => {
          return (
            <div>
              <button
                onClick={() => {
                  props.onOpenChange();
                }}
              >
                View details
              </button>
              {props.timeoffQuery?.data?.timeoffs?.map((timeoff, index) => (
                <div key={index} data-testid={`timeoff-${index}`}>
                  <span data-testid={`duration-${index}`}>
                    Duration: {timeoff.duration} days
                  </span>
                  <span data-testid={`formatted-${index}`}>
                    {timeoff.formattedDate}
                  </span>
                </div>
              ))}
            </div>
          );
        }}
      />,
      { wrapper: TestProviders },
    );

    // Open the drawer to load timeoff data
    const openButton = screen.getByText(/View details/i);
    openButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('duration-0')).toBeInTheDocument();
    });

    // Should be 8 days (excluding 4 days with 0 hours: 2025-12-25, 2025-12-27, 2025-12-28, 2026-01-01)
    // Total days: 12, Days with hours > 0: 8
    expect(screen.getByTestId('duration-0')).toHaveTextContent(
      'Duration: 8 days',
    );
  });

  it('should handle timeoff with all working days correctly', async () => {
    // Mock timeoff data with only working days (all have hours > 0)
    const timeoffAllWorkingDays = {
      data: {
        total_count: 1,
        current_page: 1,
        total_pages: 1,
        timeoffs: [
          {
            id: 'test-timeoff-id-2',
            status: 'approved',
            start_date: '2025-10-21',
            end_date: '2025-10-22',
            timeoff_type: 'paid_time_off',
            timeoff_days: [
              { hours: 8, day: '2025-10-21' },
              { hours: 8, day: '2025-10-22' },
            ],
          },
        ],
      },
    };

    server.use(
      http.get('*/v1/timeoff*', () => {
        return HttpResponse.json(timeoffAllWorkingDays);
      }),
    );

    render(
      <PaidTimeOffContainer
        employmentId='test-id'
        employeeName='John Doe'
        proposedTerminationDate='2025-12-15'
        render={(props) => {
          return (
            <div>
              <button onClick={() => props.onOpenChange()}>View details</button>
              {props.timeoffQuery?.data?.timeoffs?.map((timeoff, index) => (
                <div key={index} data-testid={`timeoff-${index}`}>
                  <span data-testid={`duration-${index}`}>
                    Duration: {timeoff.duration} days
                  </span>
                </div>
              ))}
            </div>
          );
        }}
      />,
      { wrapper: TestProviders },
    );

    const openButton = screen.getByText(/View details/i);
    openButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('duration-0')).toBeInTheDocument();
    });

    // Should be 2 days (both have hours > 0)
    expect(screen.getByTestId('duration-0')).toHaveTextContent(
      'Duration: 2 days',
    );
  });
});
