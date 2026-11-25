import { parseLocalDate } from '@/src/common/dates';
import { Step } from '@/src/flows/useStepState';
import {
  CompanyManagerNames,
  TimeOffCreator,
  TimeOffListItem,
  TimeOffListStepKeys,
  TimeOffRequest,
  TimeOffRequestDetail,
  TimeOffRequestPeople,
  TimeOffStepKeys,
  TimeOffTeamMember,
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

export const LIST_STEPS: Record<
  TimeOffListStepKeys,
  Step<TimeOffListStepKeys>
> = {
  list: { index: 0, name: 'list' },
  review: { index: 1, name: 'review' },
};

const LIST_STEP_LABELS: Record<TimeOffListStepKeys, string> = {
  list: 'Requests',
  review: 'Review',
};

export const LIST_STEPS_ARRAY = Object.values(LIST_STEPS).map((step) => ({
  ...step,
  label: LIST_STEP_LABELS[step.name],
}));

export const STATUS_LABELS: Record<TimeOffRequest['status'], string> = {
  requested: 'Requested',
  approved: 'Approved',
  declined: 'Declined',
  taken: 'Taken',
  cancel_requested: 'Cancellation requested',
  cancelled: 'Cancelled',
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

const formatDate = (date: string) =>
  parseLocalDate(date).toLocaleDateString('en-US', DATE_FORMAT);

const formatDateTime = (dateTime: string) =>
  new Date(dateTime).toLocaleDateString('en-US', DATE_FORMAT);

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

const getCreatedBy = (
  creatorId: string | null | undefined,
  teamMember: TimeOffTeamMember | undefined,
  companyManagerNames: CompanyManagerNames | undefined,
): TimeOffCreator | undefined => {
  if (!creatorId || !companyManagerNames) {
    return undefined;
  }
  const managerName = companyManagerNames[creatorId];
  if (managerName) {
    return { name: managerName, role: 'Employer' };
  }
  if (!teamMember?.full_name) {
    return undefined;
  }
  return {
    name: teamMember.full_name,
    role: teamMember.type === 'contractor' ? 'Contractor' : 'Employee',
  };
};

const isApproved = (timeOffRequest: TimeOffRequest) =>
  timeOffRequest.status === 'approved' || timeOffRequest.status === 'taken';

export const getTimeOffRequestPeople = (
  timeOffRequest: TimeOffRequest,
  teamMember: TimeOffTeamMember | undefined,
  companyManagerNames: CompanyManagerNames | undefined,
): TimeOffRequestPeople => ({
  teamMemberName: teamMember?.full_name || undefined,
  createdBy: getCreatedBy(
    timeOffRequest.created_by_id,
    teamMember,
    companyManagerNames,
  ),
  approverName:
    isApproved(timeOffRequest) && timeOffRequest.approver_id
      ? companyManagerNames?.[timeOffRequest.approver_id]
      : undefined,
});

const optionalDetail = (
  name: TimeOffRequestDetail['name'],
  label: string,
  value: string | null | undefined,
): TimeOffRequestDetail[] => (value ? [{ name, label, value }] : []);

export const getTimeOffRequestDetails = (
  timeOffRequest: TimeOffRequest,
  { teamMemberName, createdBy, approverName }: TimeOffRequestPeople,
): TimeOffRequestDetail[] => {
  const {
    status,
    decline_reason: declineReason,
    cancel_reason: cancelReason,
    cancelled_at: cancelledAt,
    inserted_at: insertedAt,
    updated_at: updatedAt,
    approved_at: approvedAt,
  } = timeOffRequest;
  const isDeclined = status === 'declined';

  return [
    { name: 'status', label: 'Status', value: STATUS_LABELS[status] },
    ...optionalDetail('team_member', 'Team member', teamMemberName),
    ...optionalDetail(
      'decline_reason',
      'Reason for decline',
      isDeclined ? declineReason : undefined,
    ),
    ...optionalDetail(
      'cancelled_on',
      'Cancelled on',
      status === 'cancelled' && cancelledAt
        ? formatDateTime(cancelledAt)
        : undefined,
    ),
    {
      name: 'leave_policy',
      label: 'Type',
      value: timeOffRequest.leave_policy.name,
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
    ...optionalDetail('notes', 'Notes', timeOffRequest.notes),
    ...optionalDetail(
      'requested_on',
      'Requested on',
      insertedAt ? formatDateTime(insertedAt) : undefined,
    ),
    ...optionalDetail(
      'last_edited_on',
      'Last edited on',
      insertedAt && updatedAt && updatedAt !== insertedAt
        ? formatDateTime(updatedAt)
        : undefined,
    ),
    ...optionalDetail(
      'created_by',
      'Requested by',
      createdBy ? `${createdBy.name} (${createdBy.role})` : undefined,
    ),
    ...optionalDetail('edit_reason', 'Edit reason', timeOffRequest.edit_reason),
    ...optionalDetail('approved_by', 'Approved by', approverName),
    ...optionalDetail(
      'approved_on',
      'Approved on',
      isApproved(timeOffRequest) && approvedAt
        ? formatDateTime(approvedAt)
        : undefined,
    ),
    ...optionalDetail(
      'cancel_reason',
      'Cancellation reason',
      status === 'cancel_requested' || status === 'cancelled'
        ? cancelReason
        : undefined,
    ),
    ...optionalDetail(
      'cancel_decline_reason',
      'Reason for declining cancellation',
      isDeclined ? undefined : declineReason,
    ),
  ];
};

const LISTED_DETAILS: TimeOffRequestDetail['name'][] = [
  'team_member',
  'leave_policy',
  'status',
  'start_date',
  'end_date',
  'duration',
];

export const getTimeOffListItems = (
  timeOffRequests: TimeOffRequest[],
  teamMembers: Partial<Record<string, TimeOffTeamMember>>,
  companyManagerNames: CompanyManagerNames | undefined,
): TimeOffListItem[] =>
  timeOffRequests.map((timeOffRequest) => {
    const people = getTimeOffRequestPeople(
      timeOffRequest,
      teamMembers[timeOffRequest.employment_id],
      companyManagerNames,
    );
    const details = getTimeOffRequestDetails(timeOffRequest, people);
    return {
      timeOffRequest,
      ...people,
      details,
      listedDetails: LISTED_DETAILS.flatMap((name) =>
        details.filter((detail) => detail.name === name),
      ),
      canDecide:
        timeOffRequest.status === 'requested' ||
        timeOffRequest.status === 'cancel_requested',
    };
  });
