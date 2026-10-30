import { parseLocalDate } from '@/src/common/dates';
import { Step } from '@/src/flows/useStepState';
import {
  TimeOffRequest,
  TimeOffRequestDetail,
  TimeOffStepKeys,
} from '@/src/flows/TimeOff/types';

export const STEPS: Record<TimeOffStepKeys, Step<TimeOffStepKeys>> = {
  request_id: { index: 0, name: 'request_id' },
  review: { index: 1, name: 'review' },
};

const STEP_LABELS: Record<TimeOffStepKeys, string> = {
  request_id: 'Request ID',
  review: 'Review',
};

export const STEPS_ARRAY = Object.values(STEPS).map((step) => ({
  ...step,
  label: STEP_LABELS[step.name],
}));

const STATUS_LABELS: Record<TimeOffRequest['status'], string> = {
  requested: 'Requested',
  approved: 'Approved',
  declined: 'Declined',
  taken: 'Taken',
  cancel_requested: 'Cancellation requested',
  cancelled: 'Cancelled',
};

const formatDate = (date: string) =>
  parseLocalDate(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const pluralize = (count: number, unit: string) =>
  `${count} ${unit}${count === 1 ? '' : 's'}`;

const formatDuration = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return (
    [
      hours > 0 && pluralize(hours, 'hour'),
      minutes > 0 && pluralize(minutes, 'minute'),
    ]
      .filter(Boolean)
      .join(' ') || pluralize(0, 'minute')
  );
};

export const getTimeOffRequestDetails = (
  timeOffRequest: TimeOffRequest,
): TimeOffRequestDetail[] => [
  {
    name: 'leave_policy',
    label: 'Type',
    value: timeOffRequest.leave_policy.name,
  },
  {
    name: 'status',
    label: 'Status',
    value: STATUS_LABELS[timeOffRequest.status],
  },
  {
    name: 'start_date',
    label: 'Start date',
    value: formatDate(timeOffRequest.start_date),
  },
  {
    name: 'end_date',
    label: 'End date',
    value: formatDate(timeOffRequest.end_date),
  },
  {
    name: 'duration',
    label: 'Duration',
    value: formatDuration(timeOffRequest.total_minutes),
  },
  ...(timeOffRequest.notes
    ? [{ name: 'notes' as const, label: 'Notes', value: timeOffRequest.notes }]
    : []),
  ...(timeOffRequest.cancel_reason
    ? [
        {
          name: 'cancel_reason' as const,
          label: 'Cancellation reason',
          value: timeOffRequest.cancel_reason,
        },
      ]
    : []),
];
