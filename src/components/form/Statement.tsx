import { useFormFields } from '@/src/context';
import { sanitizeHtml } from '@/src/lib/utils';
import { StatementComponentProps } from '@/src/types/fields';

type StatementProps = StatementComponentProps['data'];

export function Statement({ title, description, severity }: StatementProps) {
  const { components } = useFormFields();

  const Component = components.statement;

  if (!Component) {
    throw new Error(`Statement component not found`);
  }

  return (
    <Component
      data={{
        title: title ? sanitizeHtml(title) : undefined,
        description: sanitizeHtml(description),
        severity,
      }}
    />
  );
}
