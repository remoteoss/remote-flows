import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { PropsWithChildren } from 'react';
import { beforeEach, describe, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { employment } from '@/src/flows/ContractAmendment/tests/fixtures'; // TODO: Move this to a shared folder????
import { server } from '@/src/tests/server';
import {
  RenderProps,
  TerminationFlow,
} from '@/src/flows/Termination/TerminationFlow';
import { render, screen } from '@testing-library/react';
import { timeoff } from '@/src/flows/Termination/tests/fixtures';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <FormFieldsProvider components={{}}>{children}</FormFieldsProvider>
  </QueryClientProvider>
);

describe('TimeOff', () => {
  const mockRender = vi.fn(({ components }: RenderProps) => {
    const { TimeOff } = components;
    return (
      <TimeOff>
        {({ employment }) => (
          <div>
            Check {employment?.basic_information?.name as string} timeoff
            breakdown
          </div>
        )}
      </TimeOff>
    );
  });
  const defaultProps = {
    employmentId: '2ef4068b-11c7-4942-bb3c-70606c83688e',
    countryCode: 'PRT',
    options: {},
    render: mockRender,
  };
  beforeEach(() => {
    vi.clearAllMocks();

    server.use(
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json(employment);
      }),
      http.get('*/v1/timeoff', () => {
        return HttpResponse.json(timeoff);
      }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the timeoff component with the correct data', async () => {
    render(<TerminationFlow {...defaultProps} />, { wrapper });

    const employeeName = employment.data.employment.basic_information.name;

    await screen.findByText(
      `We have recorded 0 days of paid time off for ${employeeName}`,
    );
  });

  it('should render the timeoff component with the correct data when days = 1', async () => {
    server.use(
      http.get('*/v1/timeoff', () => {
        return HttpResponse.json({
          ...timeoff,
          data: {
            ...timeoff.data,
            total_count: 1,
          },
        });
      }),
    );

    render(<TerminationFlow {...defaultProps} />, { wrapper });

    const employeeName = employment.data.employment.basic_information.name;

    await screen.findByText(
      `We have recorded 1 day of paid time off for ${employeeName}`,
    );
  });

  it('should render the timeoff component with the correct data', async () => {
    render(<TerminationFlow {...defaultProps} />, { wrapper });

    const employeeName = employment.data.employment.basic_information.name;

    await screen.findByText(`Check ${employeeName} timeoff breakdown`);
  });
});
