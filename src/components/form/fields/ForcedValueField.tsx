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
          <Description
            name={name}
            description={sanitizeHtml(statement?.description || description)}
            helpCenter={helpCenter}
          />
        </>
      ) : (
        <Description
          name={name}
          description={descriptionSanitized}
          helpCenter={helpCenter}
        />
      )}
    </div>
  );
}
