import { Badge } from '@/src/components/ui/badge';
import { DailyScheduleSummaryBody } from '@/src/flows/Onboarding/components/DailySchedule/DailyScheduleSummaryBody';
import {
  DailyScheduleRenderProps,
  DailyScheduleSummaryDay,
} from '@/src/flows/Onboarding/components/DailySchedule/types';
import { resolveDailyScheduleValue } from '@/src/flows/Onboarding/components/DailySchedule/utils';

type DailyScheduleProps = DailyScheduleRenderProps;

export const DailySchedule = ({
  value,
  defaultSchedule,
  subtractBreaksFromWorkHours,
}: DailyScheduleProps) => {
  const effectiveValue = resolveDailyScheduleValue({ value, defaultSchedule });
  const summaryDays: DailyScheduleSummaryDay[] =
    effectiveValue.selected_days.map((day) => {
      const daySchedule = effectiveValue.schedule[day];
      return {
        day,
        start_time: daySchedule?.start_time ?? '',
        end_time: daySchedule?.end_time ?? '',
        break_duration_minutes: daySchedule?.break_duration_minutes ?? 0,
      };
    });

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
      </div>
    </div>
  );
};
