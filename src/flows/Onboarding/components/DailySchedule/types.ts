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

/**
 * A single row in the edit form representing one day of the week.
 * This is the framework-agnostic representation that customers work with.
 */
export type DailyScheduleEditFormRow = {
  day: Weekday;
  checked: boolean;
  start_time: string;
  end_time: string;
  break_duration_minutes: string;
};

/**
 * Framework-agnostic state for the daily schedule edit form.
 * Exposes only the data customers need, not react-hook-form internals.
 */
export type DailyScheduleEditState = {
  /** The current schedule rows being edited */
  rows: DailyScheduleEditFormRow[];
  /** Live preview of the schedule as summary days (unsaved changes) */
  unsavedSummaryDays: DailyScheduleSummaryDay[];
  /** Weekly hours validation error for the current draft */
  hoursRangeError: DailyScheduleHoursError | null;
  /** Whether the form has unsaved changes from the default schedule */
  isDirty: boolean;
  /** Form-level validation error (e.g., "Select at least one work day") */
  selectionError: string | null;
};

/**
 * Framework-agnostic actions for the daily schedule edit form.
 * These are stable functions that don't expose form library details.
 */
export type DailyScheduleEditActions = {
  /** Update a specific field in a specific row */
  updateRow: (
    index: number,
    field: keyof DailyScheduleEditFormRow,
    value: unknown,
  ) => void;
  /** Toggle a day's checked state */
  toggleDay: (index: number) => void;
  /** Save the current draft (validates and calls setValue) */
  save: () => Promise<void>;
  /** Reset the schedule to the default */
  reset: () => void;
  /** Discard unsaved edits and close (resets to last saved schedule) */
  close: () => void;
  /** Check if the current form state is valid */
  validate: () => boolean;
};

/**
 * The stable public API for the daily schedule edit form.
 * This is what customers receive and work with - no react-hook-form internals.
 */
export type DailyScheduleEditBag = {
  state: DailyScheduleEditState;
  actions: DailyScheduleEditActions;
};

export type DailyScheduleRenderProps = {
  /** The summary days derived from the current saved value and default schedule. */
  summaryDays: DailyScheduleSummaryDay[];
  /** Whether to subtract breaks from work hours in the summary display. */
  subtractBreaksFromWorkHours: boolean;
  /** The hours error for the currently saved schedule (shown in read-only summary). */
  savedScheduleHoursError: DailyScheduleHoursError | null;
  /**
   * The edit form API with state and actions.
   *
   */
  editBag: ReturnType<
    typeof import('@/src/flows/Onboarding/components/DailySchedule/useDailyScheduleEditForm').useDailyScheduleEditForm
  >;
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
