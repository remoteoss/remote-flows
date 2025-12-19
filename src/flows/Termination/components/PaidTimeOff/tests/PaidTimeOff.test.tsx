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
});
