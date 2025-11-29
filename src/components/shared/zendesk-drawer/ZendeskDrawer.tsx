import { useZendeskArticle } from '@/src/components/shared/zendesk-drawer/api';
import { useFormFields } from '@/src/context';
import { buildZendeskURL } from '@/src/components/shared/zendesk-drawer/utils';
import { ZendeskDrawerDefault } from '@/src/components/form/fields/default/ZendeskDrawerDefault';

export type ZendeskDrawerProps = {
  Trigger: React.ReactElement;
  zendeskId: number;
  open: boolean;
  onClose: () => void;
};

export const ZendeskDrawer = ({
  Trigger,
  zendeskId,
  open,
  onClose,
}: ZendeskDrawerProps) => {
  const { components } = useFormFields();
  const zendeskURL = buildZendeskURL(zendeskId);

  const handleClose = () => {
    onClose?.();
  };

  const { data, isLoading, error } = useZendeskArticle(zendeskId, {
    enabled: open,
  });

  const CustomZendeskDrawer = components?.zendeskDrawer || ZendeskDrawerDefault;

  return (
    <CustomZendeskDrawer
      open={open}
      onClose={handleClose}
      data={data}
      isLoading={isLoading}
      error={error}
      zendeskURL={zendeskURL}
      Trigger={Trigger}
    />
  );
};
