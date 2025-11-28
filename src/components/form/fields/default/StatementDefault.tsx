import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { StatementComponentProps } from '@/src/types/fields';
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
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && (
        <AlertDescription dangerouslySetInnerHTML={{ __html: description }} />
      )}
    </Alert>
  );
}
