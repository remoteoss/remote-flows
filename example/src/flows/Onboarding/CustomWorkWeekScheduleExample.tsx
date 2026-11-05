/**
 * Example: Custom WorkWeekSchedule Implementation
 *
 * This demonstrates how to build a custom work week schedule UI (used by
 * countries such as Vietnam) using the headless API.
 *
 * The WorkWeekScheduleContainer is already wrapped in hooks.tsx, so this
 * component receives WorkWeekScheduleRenderProps directly from the render prop.
 * Enable it with the `work_week_schedule` feature. The titles and field labels
 * come from the schema through `labels`.
 */

import { useState } from 'react';
import {
  buildWorkWeekScheduleSummary,
  type WorkWeekScheduleRenderProps,
} from '@remoteoss/remote-flows';

const TIME_FIELDS = [
  { key: 'start_time', labelKey: 'startTime' },
  { key: 'end_time', labelKey: 'endTime' },
  { key: 'lunch_start_time', labelKey: 'breakStartTime' },
  { key: 'lunch_end_time', labelKey: 'breakEndTime' },
] as const;

export function CustomWorkWeekSchedule({
  labels,
  summary,
  config,
  savedScheduleError,
  editBag,
}: WorkWeekScheduleRenderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { state, actions } = editBag;

  const closeEditor = () => {
    actions.reset();
    setIsEditing(false);
  };

  return (
    <div className='border rounded p-4 bg-yellow-50'>
      <div className='mb-2 p-2 bg-yellow-200 rounded text-sm font-semibold'>
        🎨 Custom WorkWeekSchedule UI (using headless API)
      </div>

      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-semibold'>{labels.title}</h3>
        <button
          type='button'
          onClick={() => (isEditing ? closeEditor() : setIsEditing(true))}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
        >
          {isEditing ? 'Close' : summary.isDefined ? 'Edit schedule' : 'Define'}
        </button>
      </div>

      {!isEditing && (
        <div className='text-sm text-gray-600'>
          {summary.isDefined ? (
            buildWorkWeekScheduleSummary(summary).map((line) => (
              <p key={line.key}>
                {line.segments.map((segment, index) =>
                  segment.bold ? (
                    <strong key={index}>{segment.text}</strong>
                  ) : (
                    segment.text
                  ),
                )}
              </p>
            ))
          ) : (
            <p>No working hours defined yet.</p>
          )}
          {savedScheduleError && (
            <p className='text-red-600'>{savedScheduleError}</p>
          )}
        </div>
      )}

      {isEditing && (
        <div className='space-y-4'>
          <p className='text-sm text-gray-600'>
            Allowed between {config.minStartTime ?? '00:00'} and{' '}
            {config.maxEndTime ?? '23:59'}
            {config.minBreakMinutes
              ? `, with a break of at least ${config.minBreakMinutes} minutes`
              : ''}
            .
          </p>

          <div className='grid grid-cols-2 gap-4'>
            {TIME_FIELDS.map(({ key, labelKey }) => (
              <label key={key} className='flex flex-col gap-1 text-sm'>
                {labels[labelKey]}
                <input
                  type='time'
                  value={state.draft[key] ?? ''}
                  onChange={(e) => actions.update(key, e.target.value)}
                  className='border rounded px-2 py-1 bg-white'
                />
              </label>
            ))}
          </div>

          <p className='text-sm text-gray-600'>
            {labels.workingHours} per day:{' '}
            <strong>{state.workingHours}h</strong>
          </p>

          {state.error && <p className='text-red-600 text-sm'>{state.error}</p>}

          <div className='flex gap-2'>
            <button
              type='button'
              onClick={closeEditor}
              className='px-4 py-2 border rounded hover:bg-gray-100'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={async () => {
                const { saved } = await actions.save();
                if (saved) {
                  setIsEditing(false);
                }
              }}
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
