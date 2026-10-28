import { Button } from '@/src/components/ui/button';
import { GroupArrayComponentProps } from '@/src/types/remoteFlows';

export function GroupArrayFieldDefault({
  name,
  label,
  addFieldText,
  rows,
  canAdd,
  add,
  error,
}: GroupArrayComponentProps) {
  const errorId = `${name}-error`;

  return (
    <div
      role='group'
      aria-label={label}
      aria-describedby={error ? errorId : undefined}
      className='grid gap-4 RemoteFlows__GroupArrayField'
    >
      <p className='text-sm font-semibold'>{label}</p>
      {rows.map((row) => (
        <div
          key={row.id}
          role='group'
          aria-label={`${label} ${row.index + 1}`}
          className='grid gap-4 RemoteFlows__GroupArrayField__Row'
        >
          <div className='grid grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-4'>
            {row.fields}
          </div>
          {row.canRemove ? (
            <div>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                aria-label={`Remove ${label} ${row.index + 1}`}
                onClick={row.remove}
              >
                Remove
              </Button>
            </div>
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
          <Button type='button' variant='ghost' size='sm' onClick={add}>
            {addFieldText}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
