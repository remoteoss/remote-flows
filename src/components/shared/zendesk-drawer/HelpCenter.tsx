import { ZendeskTriggerButton } from './ZendeskTriggerButton';

type HelpCenterProps = {
  helpCenter?: { callToAction: string; id: string };
};

export function HelpCenter({ helpCenter }: HelpCenterProps) {
  if (!helpCenter) {
    return null;
  }
  return (
    <ZendeskTriggerButton zendeskId={Number(helpCenter.id)}>
      {helpCenter.callToAction}
    </ZendeskTriggerButton>
  );
}
