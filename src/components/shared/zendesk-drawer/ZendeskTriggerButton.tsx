import { ZendeskDrawer } from './ZendeskDrawer';
import { useState } from 'react';
import { useFormFields } from '@/src/context';

interface ZendeskTriggerButtonProps {
  /**
   * The Zendesk ID for the help article
   */
  zendeskId: number;
  /**
   * The class name for the button
   */
  className?: string;
  /**
   * The callback function to be called when the button is clicked
   */
  onClick?: (zendeskId: number) => void;
  /**
   * The children to be rendered inside the button
   */
  children?: React.ReactNode;
  /**
   * Whether to open the help article in a new tab
   */
  external?: boolean;
}

export function ZendeskTriggerButton({
  zendeskId,
  className,
  onClick,
  children,
  external = false,
}: ZendeskTriggerButtonProps) {
  const { components } = useFormFields();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (!external) {
      setIsOpen(true);
    }
    onClick?.(zendeskId);
  };

  const CustomZendeskTriggerButton = components?.zendeskTriggerButton;

  if (!CustomZendeskTriggerButton) {
    throw new Error(`Zendesk trigger button component not found`);
  }

  const triggerElement = (
    <CustomZendeskTriggerButton
      zendeskId={zendeskId}
      className={className}
      onClick={handleClick}
      external={external}
    >
      {children}
    </CustomZendeskTriggerButton>
  );

  if (external) {
    return triggerElement;
  }

  return (
    <ZendeskDrawer
      zendeskId={zendeskId}
      open={isOpen}
      onClose={() => setIsOpen(false)}
      Trigger={triggerElement}
    />
  );
}
