import { useMagicLink } from '@/src/common/api';
import { useIdentity } from '@/src/common/api/identity';
import { useFormFields } from '@/src/context';
import { mutationToPromise } from '@/src/lib/mutations';
import { ReactNode } from 'react';

export function useMagicLinkUserId() {
  const { data: identity, isLoading } = useIdentity();
  return {
    userId: identity && 'user' in identity ? identity.user.id : undefined,
    isLoading,
  };
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
  const { userId } = useMagicLinkUserId();
  const magicLink = useMagicLink();

  const CustomButton = components?.button;
  if (!CustomButton) {
    throw new Error(`Button component not found`);
  }

  if (!userId) {
    return null;
  }

  const { mutateAsyncOrThrow } = mutationToPromise(magicLink);

  const openPage = async () => {
    const tab = window.open('', '_blank');
    if (tab) {
      tab.opener = null;
    }

    try {
      const response = await mutateAsyncOrThrow({ user_id: userId, path });
      const url = response?.data.url;

      if (!url) {
        tab?.close();
        return;
      }

      if (tab) {
        tab.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error: unknown) {
      tab?.close();
      console.error(error);
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
