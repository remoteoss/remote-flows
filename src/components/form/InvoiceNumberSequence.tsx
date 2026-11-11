import { INVOICE_NUMBER_SEQUENCE_PATH } from '@/src/common/invoice-schedules/constants';
import { Statement } from '@/src/components/form/Statement';
import { MagicLinkButton } from '@/src/components/shared/magic-link/MagicLinkButton';
import { JSFCustomComponentProps } from '@/src/types/remoteFlows';

export function InvoiceNumberSequence({
  label,
  description,
}: JSFCustomComponentProps) {
  return (
    <div className='space-y-2'>
      <Statement
        title={label}
        description={description as string}
        severity='info'
      />
      <MagicLinkButton
        path={INVOICE_NUMBER_SEQUENCE_PATH}
        className='h-auto p-0 align-baseline text-xs underline RemoteFlows__InvoiceNumberSequenceEdit'
      >
        Edit sequence
      </MagicLinkButton>
    </div>
  );
}
