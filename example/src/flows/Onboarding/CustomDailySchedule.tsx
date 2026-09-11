/**
 * Custom DailySchedule Demo
 *
 * This demonstrates how customers can rebuild the DailySchedule component
 * using only exported pieces from @remoteoss/remote-flows:
 * - Types (DailyScheduleRenderProps, etc.)
 * - Utilities (buildDailyScheduleSummary, calculateWorkingHours)
 * - Form adapters (FormProvider, useFormContext - NOT direct react-hook-form!)
 * - UI primitives from /internals (Dialog, Button, Input, etc.)
 *
 * NO component exports needed - customers rebuild with primitives!
 *
 * Note: This is demo/example code showing the pattern. In production,
 * customers would properly type their form paths.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import type {
  DailyScheduleRenderProps,
  DailyScheduleSummaryDay,
  DailyScheduleHoursError,
  Weekday,
} from '@remoteoss/remote-flows';
import {
  buildDailyScheduleSummary,
  calculateWorkingHours,
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

const DAY_LABELS: Record<Weekday, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

/**
 * Custom DailySchedule Component
 *
 * Rebuilt using only exported pieces - no internal components!
 */
export function CustomDailySchedule({
  summaryDays,
  subtractBreaksFromWorkHours,
  hoursError,
  formBag,
}: DailyScheduleRenderProps) {
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    await formBag.handleSave();
    // Only close if there are no validation errors
    if (Object.keys(formBag.form.formState.errors).length === 0) {
      setOpen(false);
    }
  };

  const hasFieldErrors = Object.keys(formBag.form.formState.errors).length > 0;

  return (
    <div className='flex flex-col gap-3 border-2 border-purple-400 p-4 rounded-lg'>
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
        <CustomHoursError error={hoursError} />

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
            <RFForm {...formBag.form}>
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

                {/* Map over formBag.fields with custom inputs */}
                <div>
                  {formBag.fields.map((field, index) => {
                    const row = formBag.watchedSchedule[index];
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
                        {/* Custom Checkbox */}
                        <div className='col-span-3 flex items-center gap-2'>
                          <Checkbox
                            id={`schedule.${index}.checked`}
                            checked={row?.checked}
                            onCheckedChange={(checked) => {
                              formBag.form.setValue(
                                `schedule.${index}.checked` as any,
                                checked,
                              );
                            }}
                          />
                          <Label htmlFor={`schedule.${index}.checked`}>
                            {DAY_LABELS[field.day]}
                          </Label>
                        </div>

                        {/* Custom Time Inputs */}
                        <div className='col-span-3'>
                          <Input
                            {...formBag.form.register(
                              `schedule.${index}.start_time` as any,
                            )}
                            disabled={!row?.checked}
                            placeholder='09:00'
                          />
                        </div>
                        <div className='col-span-3'>
                          <Input
                            {...formBag.form.register(
                              `schedule.${index}.end_time` as any,
                            )}
                            disabled={!row?.checked}
                            placeholder='17:00'
                          />
                        </div>
                        <div className='col-span-2'>
                          <Input
                            {...formBag.form.register(
                              `schedule.${index}.break_duration_minutes` as any,
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
                <div className='rounded-lg border-2 border-purple-300 p-4 bg-purple-50'>
                  <p className='text-sm font-medium mb-2'>Live Preview:</p>
                  <CustomSummaryBody
                    days={formBag.previewDays}
                    subtractBreaksFromWorkHours={subtractBreaksFromWorkHours}
                  />
                </div>

                {/* Validation Errors */}
                <CustomHoursError error={formBag.hoursError} />

                {formBag.rootError && (
                  <p className='text-red-600 text-sm'>{formBag.rootError}</p>
                )}

                {!formBag.rootError && hasFieldErrors && (
                  <p className='text-red-600 text-sm'>
                    Please check the form for errors. Time fields must use HH:mm
                    format (e.g., 09:00).
                  </p>
                )}

                {/* Action Buttons */}
                <div className='flex items-center gap-4 pt-4'>
                  {!formBag.isScheduleAtDefault && (
                    <Button
                      type='button'
                      variant='ghost'
                      className='gap-2'
                      onClick={formBag.handleReset}
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
                      disabled={!!formBag.hoursError}
                      className='bg-purple-600 hover:bg-purple-700'
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
