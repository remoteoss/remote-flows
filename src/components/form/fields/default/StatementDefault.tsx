import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { StatementComponentProps } from '@/src/types/fields';
import { AlertCircle } from 'lucide-react';
import { useFormFields } from '@/src/context';

export function StatementDefault({ data }: StatementComponentProps) {
  const { makeComponentsRequired } = useFormFields();
  if (makeComponentsRequired) {
    console.log('Missing component: StatementDefault');
    return null;
  }
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
