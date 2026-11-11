import { INVOICE_NUMBER_SEQUENCE_PATH } from '@/src/common/invoice-schedules/constants';
import { Statement } from '@/src/components/form/Statement';
import { MagicLinkButton } from '@/src/components/shared/magic-link/MagicLinkButton';
import { StatementComponentProps } from '@/src/types/fields';

export function InvoiceNumberSequence(
  statement: StatementComponentProps['data'],
) {
  return (
    <div className='space-y-2'>
      <Statement {...statement} />
      <MagicLinkButton
        path={INVOICE_NUMBER_SEQUENCE_PATH}
        className='h-auto p-0 align-baseline text-xs underline RemoteFlows__InvoiceNumberSequenceEdit'
      >
        Edit sequence
      </MagicLinkButton>
    </div>
  );
}
