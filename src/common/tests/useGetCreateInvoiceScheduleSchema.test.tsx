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

  it('offers an items group of up to ten rows', async () => {
    const { result } = renderForm();

    await waitFor(() => expect(result.current.data).not.toBeNull());

    const items = result.current.data?.fields.find((f) => f.name === 'items');
    expect(items).toMatchObject({
      type: 'group-array',
      minItems: 1,
      maxItems: 10,
    });
  });

  it('hands the selected currency to the item amounts', async () => {
    const { result } = renderForm({ currency: 'EUR' });

    await waitFor(() => expect(result.current.data).not.toBeNull());

    const items = result.current.data?.fields.find((f) => f.name === 'items');
    expect(items?.additionalProps).toEqual({ currency: 'EUR' });
  });

  describe('start_date minimum', () => {
    function utcDate(offsetDays: number) {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() + offsetDays);
      return date.toISOString().slice(0, 10);
    }

    async function startDateErrors(startDate: string) {
      const { result } = renderForm();

      await waitFor(() => expect(result.current.data).not.toBeNull());

      const validation = await result.current.handleValidation({
        start_date: startDate,
      });

      return validation?.formErrors?.start_date;
    }

    it('rejects a start date before today (UTC)', async () => {
      expect(await startDateErrors(utcDate(-1))).toBe(
        `The date must be ${utcDate(0)} or after.`,
      );
    });

    it('accepts today (UTC) as the start date', async () => {
      expect(await startDateErrors(utcDate(0))).toBeUndefined();
    });
  });
});
