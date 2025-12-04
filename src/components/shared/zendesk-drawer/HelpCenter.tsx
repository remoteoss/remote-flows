import { ZendeskTriggerButton } from './ZendeskTriggerButton';

type HelpCenterProps = {
  helpCenter?: { callToAction: string; id: number };
};

export function HelpCenter({ helpCenter }: HelpCenterProps) {
  if (!helpCenter) {
    return null;
  }
  return (
    <ZendeskTriggerButton zendeskId={helpCenter.id}>
      {helpCenter.callToAction}
    </ZendeskTriggerButton>
  );
}
