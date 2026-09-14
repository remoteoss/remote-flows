import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { DailyScheduleEditForm } from './DailyScheduleEditForm';
import {
  DailyScheduleDefaultDay,
  DailyScheduleValue,
  Weekday,
  WorkHoursRange,
} from '@/src/flows/Onboarding/components/DailySchedule/types';

type EditEmployeeWorkingHoursDialogProps = {
  availableWorkDays: Weekday[];
  defaultSchedule: DailyScheduleDefaultDay[];
  defaultStartTime: string;
  defaultEndTime: string;
  defaultBreakDurationMinutes: number;
  subtractBreaksFromWorkHours: boolean;
  workHoursBounds: WorkHoursRange;
  workSchedule: string | undefined;
  countryName: string;
  value: DailyScheduleValue | undefined;
  setValue: (value: DailyScheduleValue) => void;
};

export const EditEmployeeWorkingHoursDialog = ({
  availableWorkDays,
  defaultSchedule,
  defaultStartTime,
  defaultEndTime,
  defaultBreakDurationMinutes,
  subtractBreaksFromWorkHours,
  workHoursBounds,
  workSchedule,
  countryName,
  value,
  setValue,
}: EditEmployeeWorkingHoursDialogProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='link'
          className='flex items-center p-0 self-start RemoteFlows__DailySchedule__Trigger'
        >
          Edit schedule
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto px-8 py-4 RemoteFlows__DailySchedule__Content'>
        <DialogHeader>
          <DialogTitle className='RemoteFlows__DailySchedule__Title'>
            Edit employee working hours
          </DialogTitle>
        </DialogHeader>
        <DailyScheduleEditForm
          availableWorkDays={availableWorkDays}
          defaultSchedule={defaultSchedule}
          defaultStartTime={defaultStartTime}
          defaultEndTime={defaultEndTime}
          defaultBreakDurationMinutes={defaultBreakDurationMinutes}
          subtractBreaksFromWorkHours={subtractBreaksFromWorkHours}
          workHoursBounds={workHoursBounds}
          workSchedule={workSchedule}
          countryName={countryName}
          value={value}
          setValue={setValue}
          onClose={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
