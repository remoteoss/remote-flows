import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import { useFormFields, useTransformer } from '@/src/context';
import { sanitizeHtml } from '@/src/lib/utils';
import { HelpCenterDataProps } from '@/src/types/fields';

export type ForcedValueFieldProps = {
  name: string;
  value: string;
  description: string;
  statement?: {
    title?: string;
    description?: string;
  };
  label: string;
  helpCenter?: HelpCenterDataProps;
};

export function ForcedValueField({
  name,
  value,
  description,
  statement,
  label,
  helpCenter,
}: ForcedValueFieldProps) {
  const { setValue } = useFormContext();
  const { components } = useFormFields();
  const transformHtml = useTransformer();

  useEffect(() => {
    setValue(name, value);
  }, [name, value, setValue]);

  const forcedValueDescription = statement?.description || description;
  const forcedValueTitle = statement?.title
    ? sanitizeHtml(statement.title)
    : sanitizeHtml(label);

  // A forced value with no title and no description has nothing to show the user, so we
  // skip rendering entirely (the value is still set on the form via the effect above).
  const isHiddenValue = !forcedValueDescription && !statement?.title;

  if (isHiddenValue) {
    return null;
  }

  const Component = components?.forcedValue;

  if (!Component) {
    throw new Error(`Forced value component not found for field ${name}`);
  }

  return (
    <Component
      fieldData={{
        name,
        value,
        title: forcedValueTitle,
        description: forcedValueDescription,
        meta: { helpCenter },
        transformHtml,
      }}
    />
  );
}
