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

export type WorkWeekScheduleEditBag = {
  state: WorkWeekScheduleEditState;
  actions: {
    update: (
      field: keyof Omit<WorkWeekScheduleValue, 'working_hours'>,
      value: string,
    ) => void;
    reset: () => void;
    save: () => boolean;
  };
};

export type WorkWeekScheduleRenderProps = {
  label: string;
  description?: string;
  summary: WorkWeekScheduleSummary;
  config: WorkWeekScheduleConfig;
  editBag: WorkWeekScheduleEditBag;
};
