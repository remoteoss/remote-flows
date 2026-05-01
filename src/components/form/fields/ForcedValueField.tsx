import { useFormContext } from 'react-hook-form';
import { sanitizeHtml } from '@/src/lib/utils';
import { useEffect } from 'react';
import { HelpCenterDataProps } from '@/src/types/fields';
import { FormDescription } from '@/src/components/ui/form';
import { HelpCenter } from '@/src/components/shared/zendesk-drawer/HelpCenter';

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
  const forcedValueDescription = statement?.description || description;

  const forcedValueTitle = statement?.title
    ? sanitizeHtml(statement?.title)
    : sanitizeHtml(label);

  useEffect(() => {
    setValue(name, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isHiddenValue = !forcedValueDescription && !statement?.title;

  if (isHiddenValue) {
    return null;
  }

  return (
    <div>
      {forcedValueTitle && (
        <p
          className={`text-sm RemoteFlows__ForcedValue__Title__${name}`}
          dangerouslySetInnerHTML={{
            __html: forcedValueTitle,
          }}
        />
      )}
      <FormDescription
        as='span'
        className={`text-xs RemoteFlows__ForcedValue__Description__${name}`}
        helpCenter={
          <HelpCenter
            className='RemoteFlows__ForcedValue__HelpCenterLink'
            helpCenter={helpCenter}
          />
        }
      >
        {forcedValueDescription}
      </FormDescription>
    </div>
  );
}
