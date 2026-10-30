import { CirclePlusIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { BaseFormDescription } from '@/src/components/ui/form';
import { GroupArrayComponentProps } from '@/src/types/remoteFlows';

export function GroupArrayFieldDefault({
  name,
  label,
  description,
  addFieldText,
  rows,
  canAdd,
  add,
  error,
}: GroupArrayComponentProps) {
  const errorId = `${name}-error`;
  const descriptionId = `${name}-description`;
  const describedBy = [description ? descriptionId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role='group'
      aria-label={label}
      aria-describedby={describedBy || undefined}
      className='grid gap-4 RemoteFlows__GroupArrayField'
    >
      <p className='text-sm font-semibold'>{label}</p>
      {description ? (
        <BaseFormDescription
          as='div'
          id={descriptionId}
          className='RemoteFlows__GroupArrayField__Description'
        >
          {description}
        </BaseFormDescription>
      ) : null}
      {rows.map((row) => (
        <div
          key={row.id}
          role='group'
          aria-label={`${label} ${row.index + 1}`}
          className='flex items-start gap-4 RemoteFlows__GroupArrayField__Row'
        >
          <div className='grid flex-1 grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-4'>
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
          id={errorId}
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
