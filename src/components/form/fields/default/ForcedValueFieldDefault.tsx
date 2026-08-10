import { ForcedValueComponentProps } from '@/src/types/fields';
import { BaseFormDescription as Description } from '@/src/components/ui/form';
import { HelpCenter } from '@/src/components/shared/zendesk-drawer/HelpCenter';

export function ForcedValueFieldDefault({
  fieldData,
}: ForcedValueComponentProps) {
  const { name, title, description, meta } = fieldData;

  const titleId = `forced-value-${name}-title`;
  const descriptionId = `forced-value-${name}-description`;

  return (
    <div
      role='group'
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
    >
      {title && (
        <p
          id={titleId}
          className={`text-sm RemoteFlows__ForcedValue__Title__${name}`}
          dangerouslySetInnerHTML={{
            __html: title,
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
            helpCenter={meta?.helpCenter}
          />
        }
      >
        {description}
      </Description>
    </div>
  );
}
