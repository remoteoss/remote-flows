import { INVOICE_NUMBER_SEQUENCE_PATH } from '@/src/common/invoice-schedules/constants';
import {
  MagicLinkButton,
  MagicLinkErrorHandler,
  useMagicLinkUserId,
} from '@/src/components/shared/magic-link/MagicLinkButton';

const INTRO =
  "We'll automatically number all invoices after the first one based on this number.";

type InvoiceNumberSequenceLinkProps = {
  onError?: MagicLinkErrorHandler;
};

export function InvoiceNumberSequenceLink({
  onError,
}: InvoiceNumberSequenceLinkProps) {
  const userId = useMagicLinkUserId();

  if (!userId) {
    return <>{INTRO}</>;
  }

  return (
    <>
      {INTRO} You can also{' '}
      <MagicLinkButton
        path={INVOICE_NUMBER_SEQUENCE_PATH}
        onError={onError}
        className='h-auto p-0 align-baseline text-xs underline RemoteFlows__InvoiceNumberSequenceLink'
      >
        create an invoice number sequence
      </MagicLinkButton>{' '}
      that applies to all contractors.
    </>
  );
}
