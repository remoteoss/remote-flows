import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { FieldSetToggleComponentProps } from '@/src/types/remoteFlows';
import { useFormFields } from '@/src/context';

export const FieldsetToggleButtonDefault = ({
  isExpanded,
  onToggle,
  className,
  ...props
}: FieldSetToggleComponentProps) => {
  const { makeComponentsRequired } = useFormFields();
  if (makeComponentsRequired) {
    console.log('Missing component: FieldsetToggleButtonDefault');
    return null;
  }
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
