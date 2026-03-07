import { Button } from '@/src/components/ui/button';
import { ButtonComponentProps } from '@/src/types/remoteFlows';
import { useFormFields } from '@/src/context';

export const ButtonDefault = (props: ButtonComponentProps) => {
  const { makeComponentsRequired } = useFormFields();
  if (makeComponentsRequired) return null;
  const { 'data-type': dataType, ...buttonProps } = props;

  if (dataType === 'inline') {
    return <Button size='link' variant='link' {...buttonProps} />;
  }

  return <Button {...buttonProps} />;
};
