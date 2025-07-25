import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { useFormFields } from '@/src/context';
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
          description,
          severity,
        }}
      />
    );
  }

  return (
    <Alert variant="warning">
      <AlertCircle className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
