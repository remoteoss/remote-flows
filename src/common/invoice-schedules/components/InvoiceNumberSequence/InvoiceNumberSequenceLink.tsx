import {
  INVOICE_NUMBER_INTRO,
  INVOICE_NUMBER_SEQUENCE_PATH,
} from '@remoteoss/remote-flows-core';
import {
  MagicLinkButton,
  useMagicLinkUserId,
} from '@/src/components/shared/magic-link/MagicLinkButton';

export function InvoiceNumberSequenceLink() {
  const { userId, isLoading } = useMagicLinkUserId();

  if (isLoading) {
    return null;
  }

  if (!userId) {
    return <>{INVOICE_NUMBER_INTRO}</>;
  }

  return (
    <>
      {INVOICE_NUMBER_INTRO} You can also{' '}
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
