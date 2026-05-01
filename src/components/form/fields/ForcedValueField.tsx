import { useFormContext } from 'react-hook-form';
import { sanitizeHtml } from '@/src/lib/utils';
import { useEffect } from 'react';
import { HelpCenterDataProps } from '@/src/types/fields';
import { BaseFormDescription as Description } from '@/src/components/ui/form';
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

  const titleId = `forced-value-${name}-title`;
  const descriptionId = `forced-value-${name}-description`;

  useEffect(() => {
    setValue(name, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isHiddenValue = !forcedValueDescription && !statement?.title;

  if (isHiddenValue) {
    return null;
  }

  return (
    <div
      role='group'
      aria-labelledby={forcedValueTitle ? titleId : undefined}
      aria-describedby={forcedValueDescription ? descriptionId : undefined}
    >
      {forcedValueTitle && (
        <p
          id={titleId}
          className={`text-sm RemoteFlows__ForcedValue__Title__${name}`}
          dangerouslySetInnerHTML={{
            __html: forcedValueTitle,
          }}
        />
      )}
      <Description
        as='span'
        id={descriptionId}
        className={`text-xs RemoteFlows__ForcedValue__Description__${name}`}
        helpCenter={
          <HelpCenter
            className='RemoteFlows__ForcedValue__HelpCenterLink'
            helpCenter={helpCenter}
          />
        }
      >
        {forcedValueDescription}
      </Description>
    </div>
  );
}
