import { useState } from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { WorkWeekScheduleRenderProps } from '@/src/flows/Onboarding/components/WorkWeekSchedule/types';

const TIME_FIELDS = [
  { key: 'start_time', label: 'Start' },
  { key: 'end_time', label: 'End' },
  { key: 'lunch_start_time', label: 'Break starts' },
  { key: 'lunch_end_time', label: 'Break ends' },
] as const;

export const WorkWeekSchedule = ({
  label,
  description,
  summary,
  editBag,
}: WorkWeekScheduleRenderProps) => {
  const [open, setOpen] = useState(false);
  const { state, actions } = editBag;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      actions.reset();
    }
    setOpen(next);
  };

  return (
    <div className='flex flex-col gap-3 RemoteFlows__WorkWeekSchedule'>
      <div className='flex items-center gap-2'>
        <p className='text-sm font-medium'>{label}</p>
        <Badge variant='secondary'>employee&apos;s timezone</Badge>
      </div>
      {summary.isDefined ? (
        <div className='flex flex-col gap-1 text-sm text-gray-500'>
          <p>
            From <strong>{summary.startTime}</strong> to{' '}
            <strong>{summary.endTime}</strong>
          </p>
          <p>
            Break from <strong>{summary.breakStartTime}</strong> to{' '}
            <strong>{summary.breakEndTime}</strong>
          </p>
          <p>
            <strong>{summary.workingHours} hours</strong> per day
          </p>
        </div>
      ) : (
        <p className='text-sm text-gray-500'>No working hours defined yet.</p>
      )}
      {description ? (
        <p className='text-xs text-gray-500'>{description}</p>
      ) : null}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant='link' className='p-0 self-start'>
            {summary.isDefined ? 'Edit schedule' : 'Define'}
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-xl px-8 py-4'>
          <DialogHeader>
            <DialogTitle>Employee working hours</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-gray-500'>
            The times displayed are in the employee&apos;s time zone in the
            24-hour format.
          </p>
          <div className='grid grid-cols-2 gap-4'>
            {TIME_FIELDS.map(({ key, label: fieldLabel }) => (
              <div key={key} className='flex flex-col gap-1'>
                <Label htmlFor={`work-week-${key}`}>{fieldLabel}</Label>
                <Input
                  id={`work-week-${key}`}
                  type='time'
                  value={state.draft[key] ?? ''}
                  onChange={(e) => actions.update(key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <p className='text-sm'>
            Working hours: <strong>{state.workingHours}</strong>
          </p>
          {state.error ? (
            <p className='text-destructive text-sm'>{state.error}</p>
          ) : null}
          <div className='flex gap-4 justify-end'>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={() => {
                if (actions.save()) {
                  setOpen(false);
                }
              }}
            >
              Save schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
