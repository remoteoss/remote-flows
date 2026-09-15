import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { $TSFixMe } from '@/src/types/remoteFlows';
import {
  DailyScheduleValue,
  DailyScheduleSummaryDay,
  Weekday,
  DailyScheduleDefaultDay,
  WorkHoursRange,
} from '@/src/flows/Onboarding/components/DailySchedule/types';
import {
  calculateTotalWeeklyHours,
  calculateWorkingHours,
  getDailyScheduleHoursError,
  resolveDailyScheduleValue,
} from '@/src/flows/Onboarding/components/DailySchedule/utils';

/**
 * Owns the `daily_schedule` edit-modal's validation and save mapping (PAY-2868
 * Phase 3 restructure): what counts as a valid schedule is decided here, once,
 * by the library — not left for every consumer swapping in their own UI to
 * reimplement with their own react-hook-form + schema-validation setup.
 * `DailySchedule.tsx` (the shipped default) calls this hook; a consumer
 * building a fully custom UI for `daily_schedule` should call it too, rather
 * than hand-rolling the same rules. See plans/daily-schedule-field.md.
 */

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type DailyScheduleEditFormRow = {
  day: Weekday;
  checked: boolean;
  start_time: string;
  end_time: string;
  break_duration_minutes: string;
};

/** Public API row type with calculated hours */
export type DailyScheduleEditFormRowWithHours = DailyScheduleEditFormRow & {
  hours: number;
};

export type DailyScheduleEditFormData = {
  schedule: DailyScheduleEditFormRow[];
};

const dayRowSchema = z
  .object({
    day: z.string().min(1),
    checked: z.boolean(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    break_duration_minutes: z.string().optional().nullable(),
  })
  .superRefine((row, ctx) => {
    if (!row.checked) {
      return;
    }
    for (const field of ['start_time', 'end_time'] as const) {
      const value = row[field];
      if (value && !TIME_PATTERN.test(value)) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: 'Invalid time format (HH:mm)',
        });
      } else if (row.checked && !value) {
        ctx.addIssue({ code: 'custom', path: [field], message: 'Required' });
      }
    }

    if (row.checked) {
      if (!row.break_duration_minutes) {
        ctx.addIssue({
          code: 'custom',
          path: ['break_duration_minutes'],
          message: 'Required',
        });
      } else if (!/^\d+$/.test(row.break_duration_minutes)) {
        ctx.addIssue({
          code: 'custom',
          path: ['break_duration_minutes'],
          message: 'Must be a whole number of minutes',
        });
      }
    }
  });

/** What counts as a valid `daily_schedule` edit — the library's call, not the consumer's. */
export const dailyScheduleEditFormSchema = z.object({
  schedule: z
    .array(dayRowSchema)
    .refine((rows) => rows.some((row) => row.checked), {
      message: 'Select at least one work day',
    }),
});

type BuildDailyScheduleEditFormDefaultValuesOptions = {
  availableWorkDays: Weekday[];
  defaultSchedule: DailyScheduleDefaultDay[];
  defaultStartTime: string;
  defaultEndTime: string;
  defaultBreakDurationMinutes: number;
  value: DailyScheduleValue | undefined;
};

export function buildDailyScheduleEditFormDefaultValues({
  availableWorkDays,
  defaultSchedule,
  defaultStartTime,
  defaultEndTime,
  defaultBreakDurationMinutes,
  value,
}: BuildDailyScheduleEditFormDefaultValuesOptions): DailyScheduleEditFormRow[] {
  const { schedule, selected_days: selectedDays } = resolveDailyScheduleValue({
    value,
    defaultSchedule,
  });

  return availableWorkDays.map((day) => {
    const daySchedule = schedule[day];

    return {
      day,
      checked: selectedDays.includes(day),
      start_time: daySchedule?.start_time ?? defaultStartTime,
      end_time: daySchedule?.end_time ?? defaultEndTime,
      break_duration_minutes: String(
        daySchedule?.break_duration_minutes ?? defaultBreakDurationMinutes,
      ),
    };
  });
}

/**
 * True when `rows` matches the metadata-driven default schedule — ported from
 * Dragon's `compareSchedules`/`dirty` tracking (`workScheduleFieldReducer.js`),
 * which only shows its "Reset to default" button once the schedule actually
 * deviates from the default, rather than showing it unconditionally.
 */
function isDefaultSchedule(
  rows: DailyScheduleEditFormRow[],
  defaultRows: DailyScheduleEditFormRow[],
): boolean {
  return rows.every((row, index) => {
    const defaultRow = defaultRows[index];

    if (row.checked !== defaultRow.checked) {
      return false;
    }

    if (!row.checked) {
      return true;
    }

    return (
      row.start_time === defaultRow.start_time &&
      row.end_time === defaultRow.end_time &&
      row.break_duration_minutes === defaultRow.break_duration_minutes
    );
  });
}

/** The single write-back shape Tiger expects, built from a validated edit-form submission. */
export function mapDailyScheduleEditFormDataToValue(
  data: DailyScheduleEditFormData,
): DailyScheduleValue {
  const selectedRows = data.schedule.filter((row) => row.checked);

  return {
    selected_days: selectedRows.map((row) => row.day),
    schedule: selectedRows.reduce(
      (acc, row) => ({
        ...acc,
        [row.day]: {
          start_time: row.start_time,
          end_time: row.end_time,
          break_duration_minutes: Number(row.break_duration_minutes),
        },
      }),
      {},
    ),
  };
}

export type UseDailyScheduleEditFormOptions = {
  availableWorkDays: Weekday[];
  defaultSchedule: DailyScheduleDefaultDay[];
  defaultStartTime: string;
  defaultEndTime: string;
  defaultBreakDurationMinutes: number;
  value: DailyScheduleValue | undefined;
  setValue: (value: DailyScheduleValue) => void;
  subtractBreaksFromWorkHours?: boolean;
  workHoursBounds?: WorkHoursRange;
  workSchedule?: string;
  countryName?: string;
};

/** Framework-agnostic validation result */
type ValidationResult =
  | { valid: true }
  | {
      valid: false;
      selectionError?: string;
      hasFieldErrors: boolean;
      fieldErrors: Map<string, string>; // "schedule.0.start_time" -> error message
    };

/**
 * Framework-agnostic validation using the Zod schema directly.
 * Returns validation result that both RHF and custom implementations can use.
 */
function validateSchedule(rows: DailyScheduleEditFormRow[]): ValidationResult {
  const result = dailyScheduleEditFormSchema.safeParse({ schedule: rows });

  if (result.success) {
    return { valid: true };
  }

  // Extract selection error (array-level validation)
  const selectionError = result.error.issues.find(
    (issue) => issue.path[0] === 'schedule' && issue.path.length === 1,
  )?.message;

  // Build a map of field-level errors
  const fieldErrors = new Map<string, string>();
  result.error.issues.forEach((issue) => {
    // schedule[index].field - we want field-level errors only
    if (issue.path.length === 3 && issue.path[0] === 'schedule') {
      const index = issue.path[1];
      const field = issue.path[2];
      // Ensure index and field are strings/numbers, not symbols
      if (typeof index === 'number' && typeof field === 'string') {
        const key = `schedule.${index}.${field}`;
        fieldErrors.set(key, issue.message);
      }
    }
  });

  const hasFieldErrors = fieldErrors.size > 0;

  return { valid: false, selectionError, hasFieldErrors, fieldErrors };
}

/**
 * Headless edit-form for `daily_schedule`: react-hook-form + the library's
 * own validation rules + the save mapping, ready for any UI to bind to.
 */
export function useDailyScheduleEditForm({
  availableWorkDays,
  defaultSchedule,
  defaultStartTime,
  defaultEndTime,
  defaultBreakDurationMinutes,
  subtractBreaksFromWorkHours = false,
  workHoursBounds,
  workSchedule,
  countryName,
  value,
  setValue,
}: UseDailyScheduleEditFormOptions) {
  // Recomputed on every render from the latest saved `value`, so a later
  // `handleClose()` call always discards-to the current saved schedule
  // rather than whatever `value` looked like when the form first mounted.
  const savedScheduleRows = buildDailyScheduleEditFormDefaultValues({
    availableWorkDays,
    defaultSchedule,
    defaultStartTime,
    defaultEndTime,
    defaultBreakDurationMinutes,
    value,
  });

  const form = useForm<DailyScheduleEditFormData>({
    mode: 'onBlur',
    defaultValues: {
      schedule: savedScheduleRows,
    },
    resolver: zodResolver(dailyScheduleEditFormSchema) as $TSFixMe,
  });

  const { control } = form;
  useFieldArray({ name: 'schedule', control });
  const { watch, setValue: setFormValue } = form;
  const watchedSchedule = watch('schedule');

  // Export a manual save function that form components can call with their own onSuccess
  const saveValue = (data: DailyScheduleEditFormData) => {
    setValue(mapDailyScheduleEditFormDataToValue(data));
    form.reset(data);
  };

  // Discards any unsaved edits by resetting the form back to the last saved
  // schedule. Wired to every way of closing the dialog without saving
  // (Cancel, overlay click, Escape, the close button) so reopening the
  // dialog never shows stale, discarded edits.
  const handleClose = () => {
    form.reset({ schedule: savedScheduleRows });
  };

  const defaultScheduleRows = buildDailyScheduleEditFormDefaultValues({
    availableWorkDays,
    defaultSchedule,
    defaultStartTime,
    defaultEndTime,
    defaultBreakDurationMinutes,
    value: undefined,
  });

  // Resets the form to the metadata-driven default schedule, discarding both
  // the saved `value` and any unsaved edits.
  const handleReset = () => {
    form.reset({ schedule: defaultScheduleRows });
  };

  const formValues = watch('schedule');

  const isDirty = !isDefaultSchedule(formValues, defaultScheduleRows);

  // Same "checked rows -> summary days" shape the read-only summary and the
  // edit modal's live preview both build from, kept here so `hoursError`
  // reflects the schedule as the user is actively editing it.
  const unsavedSummaryDays: DailyScheduleSummaryDay[] = watchedSchedule
    .filter((row) => row.checked)
    .map((row) => ({
      day: row.day,
      start_time: row.start_time,
      end_time: row.end_time,
      break_duration_minutes: Number(row.break_duration_minutes) || 0,
    }));

  const totalWeeklyHours = calculateTotalWeeklyHours(
    unsavedSummaryDays,
    subtractBreaksFromWorkHours,
  );

  const hoursRangeError =
    workHoursBounds && countryName
      ? getDailyScheduleHoursError({
          totalWeeklyHours,
          workHoursBounds,
          countryName,
          workSchedule,
        })
      : null;

  // Framework-agnostic validation - computed from current state
  const validationResult = validateSchedule(watchedSchedule);
  const selectionError = validationResult.valid
    ? undefined
    : validationResult.selectionError;
  const hasFieldErrors = validationResult.valid
    ? false
    : validationResult.hasFieldErrors;
  const fieldErrors = validationResult.valid
    ? new Map<string, string>()
    : validationResult.fieldErrors;

  // Enrich rows with calculated hours for display
  const rowsWithHours: DailyScheduleEditFormRowWithHours[] =
    watchedSchedule.map((row) => {
      const hours = calculateWorkingHours(
        row.start_time,
        row.end_time,
        subtractBreaksFromWorkHours
          ? Number(row.break_duration_minutes) || 0
          : 0,
      );

      return {
        ...row,
        hours: Number.isNaN(hours) ? 0 : hours,
      };
    });

  // Helper to check if a specific field has an error
  const getFieldError = (
    index: number,
    field: keyof DailyScheduleEditFormRow,
  ) => {
    return fieldErrors.get(`schedule.${index}.${field}`);
  };

  // Return the stable public API - framework-agnostic
  return {
    state: {
      rows: rowsWithHours,
      unsavedSummaryDays,
      hoursRangeError,
      isDirty,
      selectionError,
      hasFieldErrors,
      getFieldError,
    },
    actions: {
      updateRow: (
        index: number,
        field: keyof DailyScheduleEditFormRow,
        value: unknown,
      ) => {
        setFormValue(`schedule.${index}.${field}` as $TSFixMe, value);
      },
      toggleDay: (index: number) => {
        const currentValue = watchedSchedule[index]?.checked;
        setFormValue(`schedule.${index}.checked`, !currentValue);
      },
      save: async () => {
        // Framework-agnostic validation
        const validation = validateSchedule(watchedSchedule);
        if (validation.valid) {
          saveValue({ schedule: watchedSchedule });
        }
        // Note: If invalid, errors are already visible via state.selectionError / state.hasFieldErrors
      },
      reset: handleReset,
      close: handleClose,
      validate: () => {
        // Framework-agnostic validation check
        const validation = validateSchedule(watchedSchedule);
        return validation.valid;
      },
    },
  };
}
