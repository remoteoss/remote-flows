import { useMagicLink } from '@/src/common/api';
import { useIdentity } from '@/src/common/api/identity';
import { useFormFields } from '@/src/context';
import { ReactNode } from 'react';

export function useMagicLinkUserId() {
  const { data: identity } = useIdentity();
  return identity && 'user' in identity ? identity.user.id : undefined;
}

type MagicLinkButtonProps = {
  /**
   * Page in Remote to open, logged in as the admin who authorized the token.
   */
  path: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
};

export function MagicLinkButton({
  path,
  children,
  className,
  disabled,
}: MagicLinkButtonProps) {
  const { components } = useFormFields();
  const userId = useMagicLinkUserId();
  const magicLink = useMagicLink();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  if (!userId) {
    return null;
  }

  const openPage = async () => {
    const response = await magicLink.mutateAsync({ user_id: userId, path });
    const url = response.data?.data?.url;

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <CustomButton
      type='button'
      data-type='inline'
      data-external
      className={className}
      disabled={disabled || magicLink.isPending}
      onClick={openPage}
    >
      {children}
    </CustomButton>
  );
}
