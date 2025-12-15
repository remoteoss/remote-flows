import { StatementDefault } from '@/src/components/form/fields/default/StatementDefault';
import { useFormFields } from '@/src/context';
import { sanitizeHtml } from '@/src/lib/utils';
import { StatementComponentProps } from '@/src/types/fields';

type StatementProps = StatementComponentProps['data'];

export function Statement({ title, description, severity }: StatementProps) {
  const { components } = useFormFields();

  const Component = components?.statement ?? StatementDefault;

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
