import { INVOICE_NUMBER_SEQUENCE_PATH } from '@remoteoss/remote-flows-core';
import { Statement } from '@/src/components/form/Statement';
import {
  MagicLinkButton,
  MagicLinkErrorHandler,
  useMagicLinkUserId,
} from '@/src/components/shared/magic-link/MagicLinkButton';
import { JSFCustomComponentProps } from '@/src/types/remoteFlows';

type InvoiceNumberSequenceBannerProps = JSFCustomComponentProps & {
  onError?: MagicLinkErrorHandler;
};

export function InvoiceNumberSequenceBanner({
  label,
  description,
  onError,
}: InvoiceNumberSequenceBannerProps) {
  const userId = useMagicLinkUserId();

  return (
    <Statement
      title={label}
      description={description as string}
      severity='info'
      action={
        userId ? (
          <MagicLinkButton
            path={INVOICE_NUMBER_SEQUENCE_PATH}
            onError={onError}
            className='h-auto p-0 align-baseline text-xs underline RemoteFlows__InvoiceNumberSequenceEdit'
          >
            Edit sequence
          </MagicLinkButton>
        ) : undefined
      }
    />
  );
}
