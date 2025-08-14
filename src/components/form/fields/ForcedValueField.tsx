import { sanitizeHtml } from '@/src/lib/utils';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export type ForcedValueFieldProps = {
  name: string;
  value: string;
  description: string;
  statement?: {
    title?: string;
    description?: string;
  };
  label: string;
};

export function ForcedValueField({
  name,
  value,
  description,
  statement,
  label,
}: ForcedValueFieldProps) {
  const { setValue } = useFormContext();

  useEffect(() => {
    setValue(name, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {statement ? (
        <>
          {/* if statement?.title is undefined which could be for example belgium contract details form, we need to use the label attribute */}
          <p
            className={`text-sm RemoteFlows__ForcedValue__Title__${name}`}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(statement?.title || label),
            }}
          />
          <p
            className={`text-xs RemoteFlows__ForcedValue__Description__${name}`}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(statement?.description || description),
            }}
          />
        </>
      ) : (
        <p
          className={`text-xs RemoteFlows__ForcedValue__Description__${name}`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
        />
      )}
    </div>
  );
}
