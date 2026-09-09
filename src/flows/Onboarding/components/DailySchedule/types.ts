import { JSFCustomComponentProps } from '@/src/types/remoteFlows';

/**
 * Ported from Dragon's WorkScheduleField (employ-starbase), reference MR
 * gitlab.com/remote-com/employ-starbase/dragon/-/merge_requests/49203.
 * See plans/daily-schedule-field.md for the full port rationale.
 */

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type DayHours = {
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
};

export type DailyScheduleDefaultDay = DayHours & {
  day: Weekday;
  hours: number;
};

/** The exact shape written back to/read from the `daily_schedule` field. */
export type DailyScheduleValue = {
  selected_days: Weekday[];
  schedule: Partial<Record<Weekday, DayHours>>;
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

/** Raw `daily_schedule['x-jsf-presentation'].metadata` block, as Tiger sends it. */
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

/** `getDefaultsFromSchema`'s output — the metadata block normalized to camelCase. */
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

/**
 * The subset of contract_details form values that affect the current work-hours
 * bounds — not the whole form.
 */
export type WorkHoursBoundsInput = {
  scheduleType?: string;
  workSchedule?: string;
};

/**
 * `daily_schedule`'s JSF Component-override props, with `value`/`setValue`
 * narrowed from JSFCustomComponentProps' generic `string` to the field's real
 * shape. `metadata` is confirmed in Phase 3: json-schema-form's field builder
 * merges `x-jsf-presentation` keys (other than `inputType`) directly onto the
 * field object, so `daily_schedule['x-jsf-presentation'].metadata` arrives as
 * `field.metadata` — not nested under `scopedJsonSchema` or `meta`.
 */
export type DailyScheduleFieldProps = Omit<
  JSFCustomComponentProps,
  'value' | 'setValue'
> & {
  value: DailyScheduleValue | undefined;
  setValue: (value: DailyScheduleValue) => void;
  metadata: DailyScheduleMetadata;
};

export type DailyScheduleRenderProps = DailyScheduleFieldProps &
  DailyScheduleDefaults & {
    workHoursBounds: WorkHoursRange;
    /** The resolved `work_schedule` value ('full_time' / 'part_time'), used to word the hours-range error. */
    workSchedule: string | undefined;
  };

export type DailyScheduleContainerProps = DailyScheduleFieldProps &
  WorkHoursBoundsInput & {
    render: (props: DailyScheduleRenderProps) => React.ReactNode;
  };
