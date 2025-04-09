import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import React from 'react';

export type StatementProps = {
  title: string;
  description: string;
  severity: 'warning' | 'error' | 'success' | 'info' | 'neutral' | 'time';
};

export function Statement({ title, description }: StatementProps) {
  return (
    <Alert variant="warning">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
