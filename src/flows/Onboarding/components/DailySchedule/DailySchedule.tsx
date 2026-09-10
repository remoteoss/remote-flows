import { DailyScheduleRenderProps } from '@/src/flows/Onboarding/components/DailySchedule/types';

type DailyScheduleProps = DailyScheduleRenderProps;

export const DailySchedule = (props: DailyScheduleProps) => {
  console.log({ props });
  return (
    <div>
      <h1>Daily Schedule</h1>
    </div>
  );
};
