import { Badge } from '@/src/components/ui/badge';
import { DailyScheduleHoursErrorBanner } from '@/src/flows/Onboarding/components/DailySchedule/DailyScheduleHoursErrorBanner';
import { DailyScheduleSummaryBody } from '@/src/flows/Onboarding/components/DailySchedule/DailyScheduleSummaryBody';
import { EditEmployeeWorkingHoursDialog } from '@/src/flows/Onboarding/components/DailySchedule/EditEmployeeWorkingHoursDialog';
import { DailyScheduleEditForm } from '@/src/flows/Onboarding/components/DailySchedule/DailyScheduleEditForm';
import { DailyScheduleRenderProps } from '@/src/flows/Onboarding/components/DailySchedule/types';

type DailyScheduleProps = DailyScheduleRenderProps;

export const DailySchedule = ({
  summaryDays,
  subtractBreaksFromWorkHours,
  hoursError,
  formBag,
}: DailyScheduleProps) => {
  return (
    <div className='flex flex-col gap-3 RemoteFlows__DailySchedule'>
      <div className='flex items-center gap-2 RemoteFlows__DailySchedule__Header'>
        <p className='text-sm font-medium RemoteFlows__DailySchedule__Title'>
          Daily schedule
        </p>
        <Badge
          variant='secondary'
          className='RemoteFlows__DailySchedule__Badge'
        >
          customized hours (employee&apos;s timezone)
        </Badge>
      </div>
      <div className='flex flex-col gap-1 RemoteFlows__DailySchedule__Summary'>
        <DailyScheduleSummaryBody
          days={summaryDays}
          subtractBreaksFromWorkHours={subtractBreaksFromWorkHours}
        />
        <DailyScheduleHoursErrorBanner error={hoursError} />
        <EditEmployeeWorkingHoursDialog>
          <DailyScheduleEditForm
            {...formBag}
            subtractBreaksFromWorkHours={subtractBreaksFromWorkHours}
          />
        </EditEmployeeWorkingHoursDialog>
      </div>
    </div>
  );
};
