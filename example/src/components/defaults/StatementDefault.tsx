import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@remoteoss/remote-flows/internals';
import { StatementComponentProps } from '@remoteoss/remote-flows';
import { AlertCircle } from 'lucide-react';

export function StatementDefault({ data }: StatementComponentProps) {
  const { title, description, severity } = data;

  const mapSeverityToVariant: Record<
    string,
    'warning' | 'destructive' | 'default'
  > = {
    warning: 'warning',
    error: 'destructive',
    info: 'default',
    success: 'warning',
  };

  const variant =
    mapSeverityToVariant[severity as keyof typeof mapSeverityToVariant] ??
    'warning';

  return (
    <Alert variant={variant}>
      <AlertCircle className='h-4 w-4' />
      {title && <AlertTitle dangerouslySetInnerHTML={{ __html: title }} />}
      {description && (
        <AlertDescription dangerouslySetInnerHTML={{ __html: description }} />
      )}
    </Alert>
  );
}
