import { BaseFormDescription } from '@/src/components/ui/form';

type FieldExtraProps = {
  extra?: React.ReactNode;
};

export function FieldExtra({ extra }: FieldExtraProps) {
  if (!extra) {
    return null;
  }

  if (typeof extra === 'string') {
    return (
      <BaseFormDescription className='RemoteFlows__FieldExtra'>
        {extra}
      </BaseFormDescription>
    );
  }

  return <>{extra}</>;
}
