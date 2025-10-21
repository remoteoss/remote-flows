import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { useFormFields } from '@/src/context';
import { sanitizeHtml } from '@/src/lib/utils';
import { AlertCircle } from 'lucide-react';

export type StatementProps = {
  title?: string;
  description: string;
  severity: 'warning' | 'error' | 'success' | 'info' | 'neutral' | 'time';
};

export function Statement({ title, description, severity }: StatementProps) {
  const { components } = useFormFields();

  if (components?.statement) {
    const CustomStatement = components?.statement;
    return (
      <CustomStatement
        data={{
          title,
          description: sanitizeHtml(description),
          severity,
        }}
      />
    );
  }

  return (
    <Alert variant='warning'>
      <AlertCircle className='h-4 w-4' />
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && (
        <AlertDescription
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
        />
      )}
    </Alert>
  );
}
