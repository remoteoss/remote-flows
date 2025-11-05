import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaidTimeOffContainer } from '@/src/flows/Termination/components/PaidTimeOff/PaidTimeOffContainer';
import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { server } from '@/src/tests/server';
import { http, HttpResponse } from 'msw';
import {
  approvedTimeoffs,
  timeoffLeavePoliciesSummaryResponse,
} from '@/src/flows/Termination/tests/fixtures';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <FormFieldsProvider components={{}}>{children}</FormFieldsProvider>
  </QueryClientProvider>
);

describe('PaidTimeOff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear(); // Clear query cache between tests
    server.use(
      http.get('*/v1/timeoff*', () => {
        return HttpResponse.json(approvedTimeoffs);
      }),
      http.get('*/v1/leave-policies/summary/*', () => {
        return HttpResponse.json(timeoffLeavePoliciesSummaryResponse);
      }),
    );
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
      { wrapper },
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByTestId('summary-data')).toBeInTheDocument();
    });

    const summaryData = screen.getByTestId('summary-data');
    expect(summaryData).toHaveTextContent('Entitled: 23 days');
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
            },
          ],
        });
      }),
      http.get('*/v1/employments/test-id', () => {
        return HttpResponse.json({
          data: {
            employment: {
              id: 'test-id',
              contract_details: {
                available_pto_type: 'unlimited',
                available_pto: 20, // Statutory minimum for this country
              },
              country: {
                code: 'ES', // Spain - uses statutory minimum when unlimited
              },
            },
          },
        });
      }),
    );

    render(
      <PaidTimeOffContainer
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
      { wrapper },
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByTestId('unlimited-summary-data')).toBeInTheDocument();
    });

    const summaryData = screen.getByTestId('unlimited-summary-data');
    expect(summaryData).toHaveTextContent('Is Unlimited: Yes');
    expect(summaryData).toHaveTextContent('Entitled: 20 days'); // Uses available_pto value from employment
    expect(summaryData).toHaveTextContent('Booked: 4 days');
    expect(summaryData).toHaveTextContent('Used: 3 days');
    expect(summaryData).toHaveTextContent(
      'Approved before termination: 2 days',
    );
    expect(summaryData).toHaveTextContent(
      'Approved after termination: 2.5 days',
    );
    // Remaining: 20 - 4 - 3 = 13 days
    expect(summaryData).toHaveTextContent('Remaining: 13 days');
  });
});
