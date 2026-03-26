import { Button } from '../ui/button';
import { cn } from '@remoteoss/remote-flows/internals';
import { FieldSetToggleComponentProps } from '@remoteoss/remote-flows';

export const FieldsetToggleButtonDefault = ({
  isExpanded,
  onToggle,
  className,
  ...props
}: FieldSetToggleComponentProps) => {
  return (
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
};
