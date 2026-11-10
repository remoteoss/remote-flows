import { useMagicLink } from '@/src/common/api';
import { useIdentity } from '@/src/common/api/identity';
import { Button } from '@/src/components/ui/button';

export const INVOICE_NUMBER_SEQUENCE_PATH =
  '/dashboard/company-settings/invoice-number-sequence';

export function InvoiceNumberSequenceLink() {
  const { data: identity } = useIdentity();
  const magicLink = useMagicLink();
  const userId = identity && 'user' in identity ? identity.user.id : undefined;

  if (!userId) {
    return null;
  }

  const openInvoiceNumberSequence = async () => {
    const response = await magicLink.mutateAsync({
      user_id: userId,
      path: INVOICE_NUMBER_SEQUENCE_PATH,
    });
    const url = response.data?.data?.url;

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      You can also{' '}
      <Button
        type='button'
        variant='link'
        size='link'
        className='h-auto p-0 align-baseline text-xs underline RemoteFlows__InvoiceNumberSequenceLink'
        disabled={magicLink.isPending}
        onClick={openInvoiceNumberSequence}
      >
        create an invoice number sequence
      </Button>{' '}
      that applies to all contractors.
    </>
  );
}
