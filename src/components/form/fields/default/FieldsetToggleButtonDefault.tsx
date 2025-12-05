import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { FieldSetToggleComponentProps } from '@/src/types/remoteFlows';

export const FieldsetToggleButtonDefault = ({
  isExpanded,
  onToggle,
  className,
  ...props
}: FieldSetToggleComponentProps) => (
  <Button
    type='button'
    className={cn(
      'RemoteFlows__Button RemoteFlows__FieldSetField__ToggleButton',
      className,
    )}
    variant='default'
    onClick={onToggle}
    {...props}
  >
    {isExpanded ? 'Remove' : 'Define'}
  </Button>
);
