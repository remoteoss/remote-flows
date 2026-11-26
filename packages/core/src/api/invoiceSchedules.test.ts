import {
  selectContractorInvoicePreview,
  selectCreatedInvoiceSchedule,
  selectExistingInvoiceSchedule,
} from './invoiceSchedules';

describe('selectCreatedInvoiceSchedule', () => {
  const body = (data: { successes: unknown[]; failures: unknown[] }) =>
    ({ data }) as Parameters<typeof selectCreatedInvoiceSchedule>[0];

  it('returns the id of the created schedule', () => {
    expect(
      selectCreatedInvoiceSchedule(
        body({ successes: [{ id: 'schedule-1' }], failures: [] }),
      ),
    ).toEqual({ id: 'schedule-1', hasFailures: false });
  });

  it('reports failures even when there is no success', () => {
    expect(
      selectCreatedInvoiceSchedule(
        body({
          successes: [],
          failures: [{ errors: { start_date: ['Is invalid'] } }],
        }),
      ),
    ).toEqual({ id: undefined, hasFailures: true });
  });

  it('reports no id and no failures when there is no body', () => {
    expect(selectCreatedInvoiceSchedule(undefined)).toEqual({
      id: undefined,
      hasFailures: false,
    });
  });
});

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

describe('selectContractorInvoicePreview', () => {
  const body = (content: string) =>
    ({
      data: { contractor_invoice_preview: { name: 'invoice.pdf', content } },
    }) as unknown as Parameters<typeof selectContractorInvoicePreview>[0];

  it('keeps the data URI prefix when the content already has it', () => {
    expect(
      selectContractorInvoicePreview(
        body('data:application/pdf;base64,JVBERi0='),
      ),
    ).toEqual({
      name: 'invoice.pdf',
      content: 'data:application/pdf;base64,JVBERi0=',
    });
  });

  it('adds the data URI prefix to bare base64 content', () => {
    expect(selectContractorInvoicePreview(body(' JVBERi0= '))).toEqual({
      name: 'invoice.pdf',
      content: 'data:application/pdf;base64,JVBERi0=',
    });
  });

  it('returns undefined when the response carries no preview', () => {
    expect(selectContractorInvoicePreview(undefined)).toBeUndefined();
  });
});
