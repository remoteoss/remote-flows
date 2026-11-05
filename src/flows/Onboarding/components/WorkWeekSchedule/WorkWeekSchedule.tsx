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
import { buildWorkWeekScheduleSummary } from '@/src/flows/Onboarding/components/WorkWeekSchedule/utils';

const TIME_FIELDS = [
  { key: 'start_time', labelKey: 'startTime' },
  { key: 'end_time', labelKey: 'endTime' },
  { key: 'lunch_start_time', labelKey: 'breakStartTime' },
  { key: 'lunch_end_time', labelKey: 'breakEndTime' },
] as const;

export const WorkWeekSchedule = ({
  labels,
  summary,
  savedScheduleError,
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
        <p className='text-sm font-medium'>{labels.title}</p>
        <Badge variant='secondary'>employee&apos;s timezone</Badge>
      </div>
      {summary.isDefined ? (
        <div className='flex flex-col gap-1 text-sm text-gray-500'>
          {buildWorkWeekScheduleSummary(summary).map((line) => (
            <p key={line.key}>
              {line.segments.map((segment, index) =>
                segment.bold ? (
                  <strong key={index}>{segment.text}</strong>
                ) : (
                  segment.text
                ),
              )}
            </p>
          ))}
        </div>
      ) : (
        <p className='text-sm text-gray-500'>No working hours defined yet.</p>
      )}
      {savedScheduleError ? (
        <p className='text-destructive text-sm'>{savedScheduleError}</p>
      ) : null}
      {labels.description ? (
        <p className='text-xs text-gray-500'>{labels.description}</p>
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
            {TIME_FIELDS.map(({ key, labelKey }) => (
              <div key={key} className='flex flex-col gap-1'>
                <Label htmlFor={`work-week-${key}`}>{labels[labelKey]}</Label>
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
            {labels.workingHours}: <strong>{state.workingHours}</strong>
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
              onClick={async () => {
                const { saved } = await actions.save();
                if (saved) {
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
