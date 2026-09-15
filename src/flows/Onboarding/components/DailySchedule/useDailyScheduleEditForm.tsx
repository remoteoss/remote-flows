import { useCallback, useEffect, useMemo, useState } from 'react';
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
      formError?: string;
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
  const formError = result.error.issues.find(
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

  return { valid: false, formError, hasFieldErrors, fieldErrors };
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
  // Memoize to prevent rebuilding on every render, which would cause
  const savedScheduleRows = useMemo(
    () =>
      buildDailyScheduleEditFormDefaultValues({
        availableWorkDays,
        defaultSchedule,
        defaultStartTime,
        defaultEndTime,
        defaultBreakDurationMinutes,
        value,
      }),
    [
      availableWorkDays,
      defaultSchedule,
      defaultStartTime,
      defaultEndTime,
      defaultBreakDurationMinutes,
      value,
    ],
  );

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
    setValidationResult(validateSchedule(savedScheduleRows));
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
    setValidationResult(validateSchedule(defaultScheduleRows));
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

  const hasIncompleteOrInvalidTimes = unsavedSummaryDays.some(
    (day) =>
      !TIME_PATTERN.test(day.start_time) || !TIME_PATTERN.test(day.end_time),
  );

  const hoursRangeError =
    workHoursBounds && countryName && !hasIncompleteOrInvalidTimes
      ? getDailyScheduleHoursError({
          totalWeeklyHours,
          workHoursBounds,
          countryName,
          workSchedule,
        })
      : null;

  // Framework-agnostic validation - stored in state and only updated onBlur or when external values change
  const [validationResult, setValidationResult] = useState<ValidationResult>(
    () => validateSchedule(savedScheduleRows),
  );

  // Validate when external value prop changes
  // Now that savedScheduleRows is memoized, this effect only runs when
  // savedScheduleRows actually changes (not on every render)
  useEffect(() => {
    setValidationResult(validateSchedule(savedScheduleRows));
  }, [savedScheduleRows]);

  // Validate onBlur - consumers call this from field onBlur handlers
  const handleBlur = useCallback(() => {
    setValidationResult(validateSchedule(watchedSchedule));
  }, [watchedSchedule]);

  const formError = validationResult.valid
    ? undefined
    : validationResult.formError;
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
      formError,
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
        // Validate immediately after toggling to update error state
        // This ensures errors are cleared/shown when checking/unchecking days
        // Compute the next schedule state with the toggled value
        const nextSchedule = watchedSchedule.map((row, i) =>
          i === index ? { ...row, checked: !currentValue } : row,
        );
        setValidationResult(validateSchedule(nextSchedule));
      },
      save: async () => {
        // Framework-agnostic validation
        const validation = validateSchedule(watchedSchedule);
        if (validation.valid) {
          saveValue({ schedule: watchedSchedule });
        } else {
          // Update state so errors become visible
          setValidationResult(validation);
        }
      },
      reset: handleReset,
      close: handleClose,
      validate: () => {
        // Framework-agnostic validation check
        const validation = validateSchedule(watchedSchedule);
        return validation.valid;
      },
      handleBlur,
    },
  };
}
