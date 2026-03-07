import { Button } from '../ui/button';
import { ButtonComponentProps } from '@remoteoss/remote-flows';

export const ButtonDefault = (props: ButtonComponentProps) => {
  const { 'data-type': dataType, ...buttonProps } = props;

  if (dataType === 'inline') {
    return <Button size='link' variant='link' {...buttonProps} />;
  }

  return <Button {...buttonProps} />;
};
