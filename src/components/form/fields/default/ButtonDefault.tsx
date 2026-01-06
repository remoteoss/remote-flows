import { Button } from '@/src/components/ui/button';
import { ButtonComponentProps } from '@/src/types/remoteFlows';

export const ButtonDefault = (props: ButtonComponentProps) => {
  const { 'data-type': dataType, ...buttonProps } = props;

  if (dataType === 'inline') {
    return <Button size='link' variant='link' {...buttonProps} />;
  }

  return <Button {...buttonProps} />;
};
