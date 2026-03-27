import { ZendeskTriggerButton } from './ZendeskTriggerButton';
import { HelpCenterDataProps } from '@/src/types/fields';

type HelpCenterProps = {
  helpCenter?: HelpCenterDataProps;
};

export function HelpCenter({ helpCenter }: HelpCenterProps) {
  if (!helpCenter || !helpCenter.id || !helpCenter.callToAction) {
    return null;
  }

  return (
    <ZendeskTriggerButton zendeskId={helpCenter.id}>
      {helpCenter.callToAction}
    </ZendeskTriggerButton>
  );
}
