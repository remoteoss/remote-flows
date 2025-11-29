import { useFormFields } from '@/src/context';
import { sanitizeHtml } from '@/src/lib/utils';
import { StatementComponentProps } from '@/src/types/fields';

type StatementProps = StatementComponentProps['data'];

export function Statement({ title, description, severity }: StatementProps) {
  const { components } = useFormFields();

  return (
    <components.statement
      data={{
        title,
        description: sanitizeHtml(description),
        severity,
      }}
    />
  );
}
