import { ZendeskTriggerButton } from './ZendeskTriggerButton';
import { HelpCenterDataProps } from '@/src/types/fields';

type HelpCenterProps = {
  helpCenter?: HelpCenterDataProps;
  className?: string;
};

export function HelpCenter({ helpCenter, className }: HelpCenterProps) {
  if (!helpCenter || !helpCenter.id || !helpCenter.callToAction) {
    return null;
  }

  return (
    <ZendeskTriggerButton zendeskId={helpCenter.id} className={className}>
      {helpCenter.callToAction}
    </ZendeskTriggerButton>
  );
}
