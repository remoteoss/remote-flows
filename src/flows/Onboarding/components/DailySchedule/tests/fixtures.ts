import { DailyScheduleMetadata } from '@/src/flows/Onboarding/components/DailySchedule/types';

/**
 * `daily_schedule['x-jsf-presentation'].metadata` block, copied from the real
 * Germany contract-details schema fixture
 * (example/src/flows/JsonSchemaPlayground/schemas/germanyContractDetails.ts,
 * PAY-2868 Phase 1).
 */
export const germanyDailyScheduleMetadata: DailyScheduleMetadata = {
  country_name: 'Germany',
  default_break_duration_minutes: 60,
  default_end_time: '18:00',
  default_start_time: '09:00',
  subtract_breaks_in_work_hours: true,
  default_schedule: [
    {
      day: 'monday',
      start_time: '09:00',
      end_time: '18:00',
      break_duration_minutes: 60,
      hours: 8,
    },
    {
      day: 'tuesday',
      start_time: '09:00',
      end_time: '18:00',
      break_duration_minutes: 60,
      hours: 8,
    },
    {
      day: 'wednesday',
      start_time: '09:00',
      end_time: '18:00',
      break_duration_minutes: 60,
      hours: 8,
    },
    {
      day: 'thursday',
      start_time: '09:00',
      end_time: '18:00',
      break_duration_minutes: 60,
      hours: 8,
    },
    {
      day: 'friday',
      start_time: '09:00',
      end_time: '18:00',
      break_duration_minutes: 60,
      hours: 8,
    },
  ],
  work_days: [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ],
  work_hours_per_week: {
    baseline: { minimum: 1, maximum: 48 },
    full_time: { minimum: 31, maximum: 48 },
    part_time: { minimum: 1, maximum: 30 },
  },
};
