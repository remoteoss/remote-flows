import { CheckIcon, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { JSFCustomComponentProps } from '@/src/types/remoteFlows';

type ContractPreviewStatementProps = JSFCustomComponentProps & {
  reviewCompleted: boolean;
};

export const ContractPreviewStatement = ({
  reviewCompleted,
  label,
  description,
}: ContractPreviewStatementProps) => {
  return (
    <Alert variant='default'>
      {reviewCompleted ? (
        <CheckIcon className='h-4 w-4' />
      ) : (
        <FileText className='h-4 w-4' />
      )}
      {label && <AlertTitle dangerouslySetInnerHTML={{ __html: label }} />}
      {description && (
        <AlertDescription dangerouslySetInnerHTML={{ __html: description }} />
      )}
    </Alert>
  );
};
