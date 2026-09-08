import { useFormContext } from 'react-hook-form';
import { DailyScheduleContainerProps } from '@/src/flows/Onboarding/components/DailySchedule/types';
import {
  getDefaultsFromSchema,
  getWorkHoursBounds,
} from '@/src/flows/Onboarding/components/DailySchedule/utils';

/**
 * Headless container for the `daily_schedule` field (PAY-2868), mirroring
 * `PaidTimeOffContainer`: owns schema-metadata derivation and calls `render`
 * with the computed payload. See plans/daily-schedule-field.md.
 *
 * `work_schedule`/`schedule_type` are sibling fields on the same form, not
 * part of `daily_schedule`'s own field data, so they're read via the
 * surrounding `useFormContext()` rather than passed in as props. The
 * `scheduleType`/`workSchedule` props exist so callers (tests, or a future
 * consumer override) can supply them directly instead.
 */
export const DailyScheduleContainer = ({
  render,
  metadata,
  scheduleType,
  workSchedule,
  ...fieldProps
}: DailyScheduleContainerProps) => {
  const { watch } = useFormContext();
  const watchedScheduleType = watch('schedule_type');
  const watchedWorkSchedule = watch('work_schedule');

  const defaults = getDefaultsFromSchema(metadata);
  const workHoursBounds = getWorkHoursBounds(defaults.workHoursPerWeekConfig, {
    scheduleType: scheduleType ?? watchedScheduleType,
    workSchedule: workSchedule ?? watchedWorkSchedule,
  });

  return render({
    ...fieldProps,
    metadata,
    ...defaults,
    workHoursBounds,
  });
};
