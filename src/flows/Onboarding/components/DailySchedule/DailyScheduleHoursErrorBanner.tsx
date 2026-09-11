import { DailyScheduleHoursError } from '@/src/flows/Onboarding/components/DailySchedule/types';

export function DailyScheduleHoursErrorBanner({
  error,
}: {
  error: DailyScheduleHoursError | null;
}) {
  if (!error) {
    return null;
  }

  return (
    <p className='text-destructive text-sm RemoteFlows__DailySchedule__HoursError'>
      <strong>{error.header}</strong> - {error.message}
    </p>
  );
}
