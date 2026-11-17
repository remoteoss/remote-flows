import { selectExistingInvoiceSchedule } from './invoiceSchedules';

describe('selectExistingInvoiceSchedule', () => {
  it('returns the first schedule that is still editable', () => {
    const response = {
      data: {
        data: {
          contractor_invoice_schedules: [
            { id: 'done', status: 'completed' },
            { id: 'open', status: 'processing' },
            { id: 'later', status: 'pending_company_action' },
          ],
        },
      },
    } as Parameters<typeof selectExistingInvoiceSchedule>[0];

    expect(selectExistingInvoiceSchedule(response)).toEqual({
      id: 'open',
      status: 'processing',
    });
  });
});
