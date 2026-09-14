/**
 * Example: Custom DailySchedule Implementation
 *
 * This demonstrates how to build a custom DailySchedule UI using the headless API.
 * Notice that we DON'T use `_form` or `_fields` - only the public `editBag` API!
 *
 * The DailyScheduleContainer is already wrapped in hooks.tsx, so this component
 * receives DailyScheduleRenderProps directly from the render prop.
 */

import { useState } from 'react';
import { type DailyScheduleRenderProps } from '@remoteoss/remote-flows';
import {
  DailyScheduleSummaryBody,
  DailyScheduleHoursErrorBanner,
} from '@remoteoss/remote-flows/internals';
import { WEEKDAY_LABELS } from '@remoteoss/remote-flows';

/**
 * Custom edit form that uses ONLY the public API - no react-hook-form!
 */
function CustomDailyScheduleEditForm({
  editBag,
  subtractBreaksFromWorkHours,
  onClose,
}: {
  editBag: DailyScheduleRenderProps['editBag'];
  subtractBreaksFromWorkHours: boolean;
  onClose: () => void;
}) {
  const { state, actions } = editBag;

  return (
    <div className='p-4 space-y-4 border rounded-lg'>
      <h3 className='text-lg font-semibold'>Custom Daily Schedule Editor</h3>

      {/* Render using state.rows - NO _fields needed! */}
      <div className='space-y-2'>
        {state.rows.map((row, index) => (
          <div
            key={row.day}
            className='flex items-center gap-4 p-2 border rounded'
          >
            <label className='flex items-center gap-2 w-32'>
              <input
                type='checkbox'
                checked={row.checked}
                onChange={() => actions.toggleDay(index)}
              />
              <span>{WEEKDAY_LABELS[row.day]}</span>
            </label>

            <input
              type='text'
              value={row.start_time}
              onChange={(e) =>
                actions.updateRow(index, 'start_time', e.target.value)
              }
              onBlur={() => actions.triggerValidation(index, 'start_time')}
              disabled={!row.checked}
              className={`border rounded px-2 py-1 ${
                state.getFieldError(index, 'start_time') ? 'border-red-500' : ''
              }`}
              placeholder='HH:mm'
              aria-invalid={!!state.getFieldError(index, 'start_time')}
            />
            <span>to</span>
            <input
              type='text'
              value={row.end_time}
              onChange={(e) =>
                actions.updateRow(index, 'end_time', e.target.value)
              }
              onBlur={() => actions.triggerValidation(index, 'end_time')}
              disabled={!row.checked}
              className={`border rounded px-2 py-1 ${
                state.getFieldError(index, 'end_time') ? 'border-red-500' : ''
              }`}
              placeholder='HH:mm'
              aria-invalid={!!state.getFieldError(index, 'end_time')}
            />
            <input
              type='number'
              value={row.break_duration_minutes}
              onChange={(e) =>
                actions.updateRow(
                  index,
                  'break_duration_minutes',
                  e.target.value,
                )
              }
              onBlur={() =>
                actions.triggerValidation(index, 'break_duration_minutes')
              }
              disabled={!row.checked}
              className={`border rounded px-2 py-1 w-20 ${
                state.getFieldError(index, 'break_duration_minutes')
                  ? 'border-red-500'
                  : ''
              }`}
              placeholder='Break (min)'
              aria-invalid={
                !!state.getFieldError(index, 'break_duration_minutes')
              }
            />
            <span className='text-sm text-gray-500 w-12 text-center'>
              {row.checked ? `${row.hours}h` : '-'}
            </span>
          </div>
        ))}
      </div>

      {/* Live preview using state.unsavedSummaryDays */}
      <div className='p-4 bg-gray-50 rounded'>
        <h4 className='font-semibold mb-2'>Preview:</h4>
        <DailyScheduleSummaryBody
          days={state.unsavedSummaryDays}
          subtractBreaksFromWorkHours={subtractBreaksFromWorkHours}
        />
      </div>

      {/* Validation errors from state */}
      {state.hoursRangeError && (
        <DailyScheduleHoursErrorBanner error={state.hoursRangeError} />
      )}
      {state.selectionError && (
        <p className='text-red-600 text-sm'>{state.selectionError}</p>
      )}

      {/* Field-level validation errors */}
      {!state.selectionError && state.hasFieldErrors && (
        <p className='text-red-600 text-sm'>
          Please check the form for errors. Time fields must use HH:mm format
          (e.g., 09:00), and all checked days must have start time, end time,
          and break duration filled in.
        </p>
      )}

      {/* Actions */}
      <div className='flex gap-2'>
        {state.isDirty && (
          <button
            onClick={actions.reset}
            className='px-4 py-2 border rounded hover:bg-gray-100'
          >
            Reset to Default
          </button>
        )}
        <button
          onClick={() => {
            actions.close();
            onClose();
          }}
          className='px-4 py-2 border rounded hover:bg-gray-100'
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            await actions.save();
            if (actions.validate()) {
              onClose();
            }
          }}
          disabled={!!state.hoursRangeError}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
        >
          Save
        </button>
      </div>
    </div>
  );
}

/**
 * Main custom component - receives DailyScheduleRenderProps from hooks.tsx
 * No need to wrap with DailyScheduleContainer - it's already done in the flow hook!
 */
export function CustomDailySchedule(props: DailyScheduleRenderProps) {
  const {
    summaryDays,
    subtractBreaksFromWorkHours,
    savedScheduleHoursError,
    editBag,
  } = props;
  const [isEditing, setIsEditing] = useState(false);

  // editBag has both public API and internals
  // Custom implementations should only use editBag.state and editBag.actions
  // NOT editBag._form or editBag._fields

  return (
    <div className='border rounded p-4 bg-yellow-50'>
      <div className='mb-2 p-2 bg-yellow-200 rounded text-sm font-semibold'>
        🎨 Custom DailySchedule UI (using headless API)
      </div>

      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-semibold'>Daily Schedule</h3>
        <button
          type='button'
          onClick={() => setIsEditing(!isEditing)}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
        >
          {isEditing ? 'Close' : 'Edit Schedule'}
        </button>
      </div>

      {/* Read-only summary */}
      {!isEditing && (
        <div className='mb-4'>
          <DailyScheduleSummaryBody
            days={summaryDays}
            subtractBreaksFromWorkHours={subtractBreaksFromWorkHours}
          />
          {savedScheduleHoursError && (
            <DailyScheduleHoursErrorBanner error={savedScheduleHoursError} />
          )}
        </div>
      )}

      {/* Edit form */}
      {isEditing && (
        <CustomDailyScheduleEditForm
          editBag={editBag}
          subtractBreaksFromWorkHours={subtractBreaksFromWorkHours}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
