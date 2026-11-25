import { selectInvoiceNumberSequenceText } from './contractorInvoiceSequence';

describe('selectInvoiceNumberSequenceText', () => {
  const response = (sequence: unknown) =>
    ({
      data: { data: { contractor_invoice_sequence: sequence } },
    }) as unknown as Parameters<typeof selectInvoiceNumberSequenceText>[0];

  it('describes an enabled sequence by the kind of each part', () => {
    expect(
      selectInvoiceNumberSequenceText(
        response({
          enabled: true,
          fields: [{ type: 'text' }, { type: 'invoice_counter' }],
        }),
      ),
    ).toBe('Text/Invoice count');
  });

  it.each([
    ['is switched off', { enabled: false, fields: [{ type: 'text' }] }],
    ['has no parts', { enabled: true, fields: [] }],
  ])('is null when the sequence %s', (_name, sequence) => {
    expect(selectInvoiceNumberSequenceText(response(sequence))).toBeNull();
  });

  it('is null when the request failed', () => {
    expect(
      selectInvoiceNumberSequenceText({
        data: undefined,
        error: { message: 'Forbidden' },
      } as unknown as Parameters<typeof selectInvoiceNumberSequenceText>[0]),
    ).toBeNull();
  });
});
