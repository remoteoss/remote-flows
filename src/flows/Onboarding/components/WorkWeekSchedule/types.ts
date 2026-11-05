export type WorkWeekScheduleValue = {
  start_time?: string;
  end_time?: string;
  lunch_start_time?: string;
  lunch_end_time?: string;
  working_hours?: number;
};

export type WorkWeekScheduleConfig = {
  minStartTime?: string;
  maxEndTime?: string;
  minBreakMinutes?: number;
  subtractBreaksFromWorkHours?: boolean;
};

export type WorkWeekScheduleLabels = {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
  workingHours: string;
};

export type WorkWeekScheduleSummary = {
  startTime?: string;
  endTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  workingHours: number;
  isDefined: boolean;
};

export type WorkWeekScheduleEditState = {
  draft: WorkWeekScheduleValue;
  workingHours: number;
  error: string | null;
};

export type WorkWeekScheduleSaveResult =
  | { saved: true }
  | { saved: false; reason: 'invalid_schedule' };

export type WorkWeekScheduleSummarySegment = { text: string; bold?: boolean };

export type WorkWeekScheduleSummaryLine = {
  key: string;
  segments: WorkWeekScheduleSummarySegment[];
};

export type WorkWeekScheduleEditBag = {
  state: WorkWeekScheduleEditState;
  actions: {
    update: (
      field: keyof Omit<WorkWeekScheduleValue, 'working_hours'>,
      value: string,
    ) => void;
    reset: () => void;
    /** Validates and saves the draft. Resolves with whether it saved and, if not, why. */
    save: () => Promise<WorkWeekScheduleSaveResult>;
  };
};

export type WorkWeekScheduleRenderProps = {
  /** The title, description and field labels from the schema, with defaults when the schema does not provide them. */
  labels: WorkWeekScheduleLabels;
  /** The saved schedule, for a read-only summary. */
  summary: WorkWeekScheduleSummary;
  /** The schedule bounds from the schema (earliest start, latest end, minimum break). */
  config: WorkWeekScheduleConfig;
  /** The validation error of the saved schedule, or null when it is valid or not defined yet. */
  savedScheduleError: string | null;
  /** The edit form API with state and actions. */
  editBag: WorkWeekScheduleEditBag;
};
