import { useMagicLink } from '@/src/common/api';
import { INVOICE_NUMBER_SEQUENCE_PATH } from '@/src/common/invoice-schedules/constants';
import { useMagicLinkUserId } from '@/src/components/shared/magic-link/MagicLinkButton';
import { useFormFields } from '@/src/context';
import { sanitizeHtml } from '@/src/lib/utils';

type InvoiceNumberSequenceProps = {
  title?: string;
  sequence: string;
};

export function InvoiceNumberSequence({
  title = '',
  sequence,
}: InvoiceNumberSequenceProps) {
  const { components } = useFormFields();
  const userId = useMagicLinkUserId();
  const magicLink = useMagicLink();

  const Component = components?.invoiceNumberSequence;

  if (!Component) {
    throw new Error(`Invoice number sequence component not found`);
  }

  const onEdit = userId
    ? async () => {
        const response = await magicLink.mutateAsync({
          user_id: userId,
          path: INVOICE_NUMBER_SEQUENCE_PATH,
        });
        const url = response.data?.data?.url;

        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    : undefined;

  return (
    <Component
      data={{
        title: sanitizeHtml(title),
        sequence,
        onEdit,
        isEditing: magicLink.isPending,
      }}
    />
  );
}
