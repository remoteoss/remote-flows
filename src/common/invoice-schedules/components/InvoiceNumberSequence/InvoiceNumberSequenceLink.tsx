import { INVOICE_NUMBER_SEQUENCE_PATH } from '@remoteoss/remote-flows-core';
import {
  MagicLinkButton,
  useMagicLinkUserId,
} from '@/src/components/shared/magic-link/MagicLinkButton';

const INTRO =
  "We'll automatically number all invoices after the first one based on this number.";

export function InvoiceNumberSequenceLink() {
  const { userId, isLoading } = useMagicLinkUserId();

  if (isLoading) {
    return null;
  }

  if (!userId) {
    return <>{INTRO}</>;
  }

  return (
    <>
      {INTRO} You can also{' '}
      <MagicLinkButton
        path={INVOICE_NUMBER_SEQUENCE_PATH}
        className='h-auto p-0 align-baseline text-xs underline RemoteFlows__InvoiceNumberSequenceLink'
      >
        create an invoice number sequence
      </MagicLinkButton>{' '}
      that applies to all contractors.
    </>
  );
}
