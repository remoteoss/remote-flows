import { Button } from '@/src/components/ui/button';
import { ButtonComponentProps } from '@/src/types/remoteFlows';

export const ButtonDefault = ({ ...props }: ButtonComponentProps) => {
  return <Button {...props} />;
};
