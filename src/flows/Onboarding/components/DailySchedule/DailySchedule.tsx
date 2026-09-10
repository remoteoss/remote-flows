import { Badge } from '@/src/components/ui/badge';
import { DailyScheduleSummaryBody } from '@/src/flows/Onboarding/components/DailySchedule/DailyScheduleSummaryBody';
import { DailyScheduleRenderProps } from '@/src/flows/Onboarding/components/DailySchedule/types';
import { getDailyScheduleSummaryDays } from '@/src/flows/Onboarding/components/DailySchedule/utils';

type DailyScheduleProps = DailyScheduleRenderProps;

export const DailySchedule = ({
  value,
  defaultSchedule,
  subtractBreaksFromWorkHours,
}: DailyScheduleProps) => {
  const summaryDays = getDailyScheduleSummaryDays(value, defaultSchedule);

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
