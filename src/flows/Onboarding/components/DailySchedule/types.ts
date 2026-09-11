import { JSFCustomComponentProps } from '@/src/types/remoteFlows';

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

type DayHours = {
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
};

export type DailyScheduleValue = {
  selected_days: Weekday[];
  schedule: Partial<Record<Weekday, DayHours>>;
};

export type DailyScheduleDefaultDay = DayHours & {
  day: Weekday;
  hours: number;
};

export type WorkHoursRange = {
  minimum: number;
  maximum: number;
};

export type WorkHoursPerWeekConfig = {
  baseline: WorkHoursRange;
  full_time: WorkHoursRange;
  part_time: WorkHoursRange;
};

export type DailyScheduleMetadata = {
  country_name: string;
  default_start_time: string;
  default_end_time: string;
  default_break_duration_minutes: number;
  default_schedule: DailyScheduleDefaultDay[];
  subtract_breaks_in_work_hours: boolean;
  work_days: Weekday[];
  work_hours_per_week: WorkHoursPerWeekConfig;
};

type DailyScheduleFieldProps = Omit<
  JSFCustomComponentProps,
  'value' | 'setValue'
> & {
  value: DailyScheduleValue | undefined;
  setValue: (value: DailyScheduleValue) => void;
  metadata: DailyScheduleMetadata;
};

export type WorkHoursBoundsInput = {
  scheduleType?: string;
  workSchedule?: string;
};

export type DailyScheduleDefaults = {
  countryName: string;
  defaultStartTime: string;
  defaultEndTime: string;
  defaultBreakDurationMinutes: number;
  defaultSchedule: DailyScheduleDefaultDay[];
  subtractBreaksFromWorkHours: boolean;
  availableWorkDays: Weekday[];
  workHoursPerWeekConfig: WorkHoursPerWeekConfig;
};

export type DailyScheduleRenderProps = DailyScheduleFieldProps &
  DailyScheduleDefaults & {
    workHoursBounds: WorkHoursRange;
    /** The resolved `work_schedule` value ('full_time' / 'part_time'), used to word the hours-range error. */
    workSchedule: string | undefined;
    /** The summary days derived from the current value and default schedule. */
    summaryDays: DailyScheduleSummaryDay[];
    /** The total weekly hours calculated from summary days. */
    totalWeeklyHours: number;
    /** The hours error message if the total hours are outside the bounds. */
    hoursError: DailyScheduleHoursError | null;
  };

export type DailyScheduleContainerProps = DailyScheduleFieldProps & {
  render: (props: DailyScheduleRenderProps) => React.ReactNode;
};

/**
 * A selected day's schedule, in the shape the summary builder groups on —
 * both the read-only summary (from `DailyScheduleValue.schedule`) and the
 * edit modal's live preview (from `watchedSchedule`) normalize to this.
 */
export type DailyScheduleSummaryDay = {
  day: Weekday;
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
};

export type DailyScheduleSummarySegment = { text: string; bold?: boolean };

export type DailyScheduleSummaryLine = {
  key: string;
  segments: DailyScheduleSummarySegment[];
};

export type DailyScheduleHoursError = {
  header: string;
  message: string;
};
