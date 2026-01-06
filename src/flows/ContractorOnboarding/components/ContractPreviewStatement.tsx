import { FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { JSFCustomComponentProps } from '@/src/types/remoteFlows';

export const ContractPreviewStatement = ({
  label,
  description,
}: JSFCustomComponentProps) => {
  return (
    <Alert variant='default'>
      <FileText className='h-4 w-4' />
      {label && <AlertTitle dangerouslySetInnerHTML={{ __html: label }} />}
      {description && (
        <AlertDescription dangerouslySetInnerHTML={{ __html: description }} />
      )}
    </Alert>
  );
};
