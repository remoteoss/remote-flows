import { FormFieldsProvider } from '@/src/RemoteFlowsProvider';
import { server } from '@/src/tests/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContractAmendmentFlow, RenderProps } from '../ContractAmendmentFlow';
import { contractAmendementSchema, employment } from './fixtures';

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <FormFieldsProvider components={{}}>{children}</FormFieldsProvider>
  </QueryClientProvider>
);

describe('ContractAmendmentFlow', () => {
  const mockRender = vi.fn(({ components }: RenderProps) => (
    <div>
      <components.Form />
      <components.SubmitButton>submit</components.SubmitButton>
      <components.ConfirmationForm />
    </div>
  ));

  const defaultProps = {
    employmentId: '2ef4068b-11c7-4942-bb3c-70606c83688e',
    countryCode: 'PRT',
    options: {},
    render: mockRender,
  };

  beforeEach(() => {
    server.use(
      http.get('*/v1/employments/*', () => {
        return HttpResponse.json(employment);
      }),
      http.get('*/v1/contract-amendments/schema*', () => {
        return HttpResponse.json(contractAmendementSchema);
      }),
    );
  });

  it('renders the flow with all components', async () => {
    render(<ContractAmendmentFlow {...defaultProps} />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /submit/i }),
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByLabelText('Reason for change')).toBeInTheDocument();
    });
    expect(screen.getByText('Effective date of change')).toBeInTheDocument();
  });

  it('passes the correct contractAmendmentBag to render prop', async () => {
    render(<ContractAmendmentFlow {...defaultProps} />, { wrapper });

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
      const renderProps = mockRender.mock.calls[0][0];

      expect(renderProps.contractAmendmentBag).toHaveProperty('initialValues');
      expect(renderProps.contractAmendmentBag).toHaveProperty(
        'handleValidation',
      );
      expect(renderProps.components).toHaveProperty('Form');
      expect(renderProps.components).toHaveProperty('SubmitButton');
      expect(renderProps.components).toHaveProperty('ConfirmationForm');
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      http.get('*/api/v1/employments/:employmentId', () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    render(<ContractAmendmentFlow {...defaultProps} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
