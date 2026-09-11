/**
 * Custom DailySchedule Demo
 *
 * This demonstrates how customers can rebuild the DailySchedule component
 * using only exported pieces from @remoteoss/remote-flows:
 * - Types (DailyScheduleRenderProps, etc.)
 * - Utilities (buildDailyScheduleSummary, calculateWorkingHours, WEEKDAY_LABELS)
 * - UI primitives from /internals (Dialog, Button, Input, Checkbox, Label, etc.)
 *
 * NO component exports needed - customers rebuild with primitives!
 * Form fields are registered manually using formBag.form.register() and setValue().
 *
 * Note: This is demo/example code showing the pattern. In production,
 * customers would properly type their form paths.
 */

import { useState } from 'react';
import type {
  DailyScheduleRenderProps,
  DailyScheduleSummaryDay,
  DailyScheduleHoursError,
} from '@remoteoss/remote-flows';
import {
  buildDailyScheduleSummary,
  calculateWorkingHours,
  WEEKDAY_LABELS,
  RFForm,
} from '@remoteoss/remote-flows';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  Input,
  Label,
  Checkbox,
} from '@remoteoss/remote-flows/internals';
import { RotateCcw } from 'lucide-react';

// Helper: Rebuild DailyScheduleSummaryBody using exported utility
function CustomSummaryBody({
  days,
  subtractBreaksFromWorkHours,
}: {
  days: DailyScheduleSummaryDay[];
  subtractBreaksFromWorkHours: boolean;
}) {
  if (days.length === 0) {
    return <p className='text-sm text-gray-500'>No work days selected yet.</p>;
  }

  // Use exported utility to format the data
  const { workHoursLines, breakLines, totalWeeklyHours } =
    buildDailyScheduleSummary(days, subtractBreaksFromWorkHours);

  return (
    <div className='flex flex-col gap-1 text-sm text-gray-500'>
      {workHoursLines.map((line) => (
        <p key={line.key}>
          {line.segments.map((seg, i) =>
            seg.bold ? (
              <strong key={i}>{seg.text}</strong>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>
      ))}
      {breakLines.map((line) => (
        <p key={line.key}>
          {line.segments.map((seg, i) =>
            seg.bold ? (
              <strong key={i}>{seg.text}</strong>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>
      ))}
      <p>
        Total of <strong>{totalWeeklyHours} hours</strong> per week
      </p>
    </div>
  );
}

// Helper: Rebuild DailyScheduleHoursErrorBanner (trivial!)
function CustomHoursError({
  error,
}: {
  error: DailyScheduleHoursError | null;
}) {
  if (!error) return null;

  return (
    <p className='text-red-600 text-sm'>
      <strong>{error.header}</strong> - {error.message}
    </p>
  );
}

/**
 * Custom DailySchedule Component
 *
 * Rebuilt using only exported pieces - no internal components!
 */
export function CustomDailySchedule({
  summaryDays,
  subtractBreaksFromWorkHours,
  savedScheduleHoursError,
  formBag,
}: DailyScheduleRenderProps) {
  const {
    form,
    isDirty,
    selectionError,
    hoursRangeError,
    fields,
    unsavedSummaryDays,
    formValues,
    handleReset,
    handleSave: formHandleSave,
  } = formBag;
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    await formHandleSave();
    // Only close if there are no validation errors
    if (Object.keys(form.formState.errors).length === 0) {
      setOpen(false);
    }
  };

  const hasFieldErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <div className='flex flex-col gap-3 border-2 p-4 rounded-lg'>
      <div className='flex items-center gap-2'>
        <p className='text-sm font-medium'>Custom Daily Schedule (Demo)</p>
        <Badge variant='secondary'>rebuilt with exported utilities</Badge>
      </div>

      <div className='flex flex-col gap-1'>
        {/* Custom Summary (using exported utility) */}
        <CustomSummaryBody
          days={summaryDays}
          subtractBreaksFromWorkHours={subtractBreaksFromWorkHours}
        />

        {/* Custom Error Banner (trivial rebuild) */}
        <CustomHoursError error={savedScheduleHoursError} />

        {/* Custom Edit Dialog (using internals Dialog + FormProvider from library) */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant='link' className='self-start p-0'>
              Edit Custom Schedule
            </Button>
          </DialogTrigger>

          <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Custom Employee Working Hours Editor</DialogTitle>
            </DialogHeader>

            {/* Use FormProvider from library (not direct react-hook-form!) */}
            <RFForm {...form}>
              <form className='space-y-4'>
                <p className='text-gray-600 text-sm'>
                  This is a custom implementation showing how customers can
                  rebuild the component using only exported pieces.
                </p>

                {/* Header */}
                <div className='grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase'>
                  <div className='col-span-3'></div>
                  <div className='col-span-3 text-center'>Start</div>
                  <div className='col-span-3 text-center'>End</div>
                  <div className='col-span-3 text-center'>Break (min)</div>
                </div>

                {/* Map over fields with custom inputs */}
                <div>
                  {fields.map((field, index) => {
                    const row = formValues[index];
                    const hours = calculateWorkingHours(
                      row?.start_time,
                      row?.end_time,
                      Number(row?.break_duration_minutes) || 0,
                    );

                    return (
                      <div
                        key={field.id}
                        className='grid grid-cols-12 gap-4 items-center py-2'
                      >
                        {/* Checkbox */}
                        <div className='col-span-3 flex items-center gap-2'>
                          <Checkbox
                            id={`schedule.${index}.checked`}
                            checked={row?.checked}
                            onCheckedChange={(checked) => {
                              form.setValue(
                                `schedule.${index}.checked`,
                                Boolean(checked),
                              );
                            }}
                          />
                          <Label htmlFor={`schedule.${index}.checked`}>
                            {WEEKDAY_LABELS[field.day]}
                          </Label>
                        </div>

                        {/* Time and Break Inputs */}
                        <div className='col-span-3'>
                          <Input
                            {...form.register(`schedule.${index}.start_time`)}
                            disabled={!row?.checked}
                            placeholder='09:00'
                          />
                        </div>
                        <div className='col-span-3'>
                          <Input
                            {...form.register(`schedule.${index}.end_time`)}
                            disabled={!row?.checked}
                            placeholder='17:00'
                          />
                        </div>
                        <div className='col-span-2'>
                          <Input
                            {...form.register(
                              `schedule.${index}.break_duration_minutes`,
                            )}
                            disabled={!row?.checked}
                            placeholder='60'
                          />
                        </div>
                        <div className='col-span-1 text-center text-sm text-gray-500'>
                          {row?.checked ? `${hours}h` : '-'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live Preview (using exported utility) */}
                <div className='rounded-lg'>
                  <p className='text-sm font-medium mb-2'>Live Preview:</p>
                  <CustomSummaryBody
                    days={unsavedSummaryDays}
                    subtractBreaksFromWorkHours={subtractBreaksFromWorkHours}
                  />
                </div>

                {/* Validation Errors */}
                <CustomHoursError error={hoursRangeError} />

                {selectionError && (
                  <p className='text-red-600 text-sm'>{selectionError}</p>
                )}

                {!selectionError && hasFieldErrors && (
                  <p className='text-red-600 text-sm'>
                    Please check the form for errors. Time fields must use HH:mm
                    format (e.g., 09:00).
                  </p>
                )}

                {/* Action Buttons */}
                <div className='flex items-center gap-4 pt-4'>
                  {isDirty && (
                    <Button
                      type='button'
                      variant='ghost'
                      className='gap-2'
                      onClick={handleReset}
                    >
                      <RotateCcw className='h-4 w-4' />
                      Reset to default
                    </Button>
                  )}
                  <div className='flex gap-4 ml-auto'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='button'
                      onClick={handleSave}
                      disabled={!!savedScheduleHoursError}
                    >
                      Save Custom Schedule
                    </Button>
                  </div>
                </div>
              </form>
            </RFForm>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
