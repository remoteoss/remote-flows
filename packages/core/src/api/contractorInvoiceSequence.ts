import { getV1ContractorInvoiceSequence } from '../client/sdk.gen';
import type { Client } from '../client/client';
import { describeInvoiceNumberSequence } from '../domains/invoice-schedule/utils';

export const contractorInvoiceSequenceOptions = (client: Client) => ({
  queryKey: ['contractor-invoice-sequence'] as const,
  retry: false as const,
  queryFn: () => getV1ContractorInvoiceSequence({ client }),
});

type ContractorInvoiceSequenceResponse = Awaited<
  ReturnType<ReturnType<typeof contractorInvoiceSequenceOptions>['queryFn']>
>;

/**
 * The company's invoice number sequence as text, or null when it has none or it is off.
 * A failed request counts as no sequence, so the form still renders.
 */
export const selectInvoiceNumberSequenceText = (
  response: ContractorInvoiceSequenceResponse,
) => {
  const sequence = response.data?.data?.contractor_invoice_sequence;
  return sequence?.enabled && sequence.fields.length
    ? describeInvoiceNumberSequence(sequence.fields)
    : null;
};
