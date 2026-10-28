import { CirclePlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { BaseFormDescription } from '@/src/components/ui/form';
import { cn } from '@/src/lib/utils';
import { GroupArrayComponentProps } from '@/src/types/remoteFlows';

export function GroupArrayFieldDefault({
  name,
  label,
  hideLabel,
  description,
  addFieldText,
  rows,
  canAdd,
  add,
  error,
}: GroupArrayComponentProps) {
  return (
    <div
      role='group'
      aria-label={label}
      data-field={name}
      className={cn(
        'grid gap-4',
        'RemoteFlows__GroupArrayField',
        `RemoteFlows__GroupArrayField__${name}`,
      )}
    >
      {hideLabel ? null : (
        <p className='text-sm font-semibold RemoteFlows__GroupArrayField__Label'>
          {label}
        </p>
      )}
      {description ? (
        <BaseFormDescription
          as='div'
          className='RemoteFlows__GroupArrayField__Description'
        >
          {description}
        </BaseFormDescription>
      ) : null}
      {rows.map((row) => (
        <div
          key={row.id}
          className='flex items-start gap-4 RemoteFlows__GroupArrayField__Row'
        >
          <div className='grid flex-1 gap-4 sm:grid-cols-2 RemoteFlows__GroupArrayField__RowFields'>
            {row.fields}
          </div>
          {row.canRemove ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              aria-label={`Remove ${label} ${row.index + 1}`}
              className='mt-8 RemoteFlows__GroupArrayField__Remove'
              onClick={row.remove}
            >
              <Trash2Icon />
            </Button>
          ) : null}
        </div>
      ))}
      {error ? (
        <p
          role='alert'
          className='text-sm text-destructive RemoteFlows__GroupArrayField__Error'
        >
          {error}
        </p>
      ) : null}
      {canAdd ? (
        <div>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='RemoteFlows__GroupArrayField__Add'
            onClick={add}
          >
            <CirclePlusIcon />
            {addFieldText}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
