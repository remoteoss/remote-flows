import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { Button } from '@/src/components/ui/button';
import { InvoiceNumberSequenceComponentProps } from '@/src/types/fields';

export function InvoiceNumberSequenceDefault({
  data,
}: InvoiceNumberSequenceComponentProps) {
  const { title, sequence, onEdit, isEditing } = data;

  return (
    <Alert>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <span className='block'>
          Your current sequence is: <strong>{sequence}</strong>
        </span>
        {onEdit ? (
          <Button
            type='button'
            size='link'
            variant='link'
            className='underline RemoteFlows__InvoiceNumberSequenceEdit'
            disabled={isEditing}
            onClick={onEdit}
          >
            Edit sequence
            <ExternalLink className='size-3' aria-hidden />
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
