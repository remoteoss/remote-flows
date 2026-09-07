import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { InvoiceScheduleFlow } from '@/src/flows/InvoiceSchedule/InvoiceScheduleFlow';
import { InvoiceScheduleForm } from '@/src/flows/InvoiceSchedule/InvoiceScheduleForm';
import { contractorsListResponse } from '@/src/flows/InvoiceSchedule/tests/fixtures';

describe('currency placeholder', () => {
  beforeEach(() => {
    queryClient.clear();
    server.use(
      http.get('*/v1/employments', () =>
        HttpResponse.json(contractorsListResponse),
      ),
    );
  });

  it('renders the placeholder without an empty-valued option', async () => {
    const errors: unknown[] = [];
    const spy = vi
      .spyOn(console, 'error')
      .mockImplementation((...a) => errors.push(a.join(' ')));

    render(<InvoiceScheduleFlow render={() => <InvoiceScheduleForm />} />, {
      wrapper: TestProviders,
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/Invoice currency/i)).toBeInTheDocument();
    });

    const select = screen.getByTestId('currency');
    const values = Array.from(select.querySelectorAll('option')).map((o) =>
      o.getAttribute('value'),
    );

    // The native select keeps its own empty "Select an option" entry; what must not exist
    // is a schema-derived option with an empty value, which Radix's Select.Item rejects.
    expect(values.filter((v) => v === '')).toHaveLength(1);
    expect(
      errors.filter((e) => String(e).includes('must have a value prop')),
    ).toHaveLength(0);

    spy.mockRestore();
  });
});
