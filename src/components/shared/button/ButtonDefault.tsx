import { ButtonComponentProps } from '@/src/types/remoteFlows';
import { Button } from '@/src/components/ui/button';

export const ButtonDefault = ({ children, ...props }: ButtonComponentProps) => {
  return <Button {...props}>{children}</Button>;
};
