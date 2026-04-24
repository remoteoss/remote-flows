import { useFormContext } from 'react-hook-form';
import { sanitizeHtml } from '@/src/lib/utils';
import { useEffect } from 'react';
import { ZendeskTriggerButton } from '@/src/components/shared/zendesk-drawer/ZendeskTriggerButton';

const Description = ({
  name,
  description,
  helpCenter,
}: {
  name: string;
  description: string;
  helpCenter?: {
    callToAction: string;
    id: number;
    url: string;
    label: string;
  };
}) => {
  return (
    <span>
      <span
        className={`text-xs RemoteFlows__ForcedValue__Description__${name}`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
      />
      {helpCenter?.callToAction && helpCenter?.id && (
        <ZendeskTriggerButton
          className='RemoteFlows__ForcedValue__HelpCenterLink'
          zendeskId={helpCenter.id}
        >
          {helpCenter.callToAction}
        </ZendeskTriggerButton>
      )}
    </span>
  );
};

export type ForcedValueFieldProps = {
  name: string;
  value: string;
  description: string;
  statement?: {
    title?: string;
    description?: string;
  };
  label: string;
  helpCenter?: {
    callToAction: string;
    id: number;
    url: string;
    label: string;
  };
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
  const descriptionSanitized = sanitizeHtml(
    statement?.description || description,
  );

  const titleSanitized = statement?.title
    ? sanitizeHtml(statement?.title)
    : sanitizeHtml(label);

  const isHiddenValue = !descriptionSanitized && !statement?.title;

  useEffect(() => {
    if (!isHiddenValue) {
      setValue(name, value);
    }
  }, [isHiddenValue, name, value, setValue]);

  if (isHiddenValue) {
    return null;
  }

  return (
    <div>
      {titleSanitized && (
        <p
          className={`text-sm RemoteFlows__ForcedValue__Title__${name}`}
          dangerouslySetInnerHTML={{
            __html: titleSanitized,
          }}
        />
      )}
      <Description
        name={name}
        description={descriptionSanitized}
        helpCenter={helpCenter}
      />
    </div>
  );
}
