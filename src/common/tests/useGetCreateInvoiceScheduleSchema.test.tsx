import { renderHook, waitFor } from '@testing-library/react';
import { useGetCreateInvoiceScheduleSchema } from '@/src/common/invoice-schedules';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

function renderForm(initialValues?: Record<string, unknown>) {
  return renderHook(
    () =>
      useGetCreateInvoiceScheduleSchema({
        enabled: true,
        employmentId: 'employment-grace',
        initialValues,
      }),
    { wrapper: TestProviders },
  );
}

describe('useGetCreateInvoiceScheduleSchema', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('shows only the first item row when there are no saved values', async () => {
    const { result } = renderForm();

    await waitFor(() => expect(result.current.data).not.toBeNull());

    const fields = result.current.data?.fields ?? [];
    expect(fields.find((f) => f.name === 'item_2_description')?.isVisible).toBe(
      false,
    );
  });

  it('shows the item rows a saved schedule needs on the first build', async () => {
    const { result } = renderForm({
      item_1_description: 'Design work',
      item_1_amount: 250000,
      item_2_description: 'Hosting',
      item_2_amount: 7500,
    });

    await waitFor(() => expect(result.current.data).not.toBeNull());

    const fields = result.current.data?.fields ?? [];
    expect(fields.find((f) => f.name === 'item_2_description')?.isVisible).toBe(
      true,
    );
    expect(fields.find((f) => f.name === 'item_3_description')?.isVisible).toBe(
      true,
    );
  });
});
