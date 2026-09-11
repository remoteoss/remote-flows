import {
  DailyScheduleSummaryDay,
  DailyScheduleSummarySegment,
} from '@/src/flows/Onboarding/components/DailySchedule/types';
import { buildDailyScheduleSummary } from '@/src/flows/Onboarding/components/DailySchedule/utils';

function DailyScheduleSummarySegments({
  segments,
}: {
  segments: DailyScheduleSummarySegment[];
}) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.bold ? (
          <strong key={index}>{segment.text}</strong>
        ) : (
          segment.text
        ),
      )}
    </>
  );
}

export function DailyScheduleSummaryBody({
  days,
  subtractBreaksFromWorkHours,
}: {
  days: DailyScheduleSummaryDay[];
  subtractBreaksFromWorkHours: boolean;
}) {
  if (days.length === 0) {
    return (
      <p className='text-sm text-gray-500 RemoteFlows__DailySchedule__Summary__Empty'>
        No work days selected yet.
      </p>
    );
  }

  const { workHoursLines, breakLines, totalWeeklyHours } =
    buildDailyScheduleSummary(days, subtractBreaksFromWorkHours);

  return (
    <div className='flex flex-col gap-1 text-sm text-gray-500 RemoteFlows__DailySchedule__Summary__Lines'>
      {workHoursLines.map((line) => (
        <p key={line.key}>
          <DailyScheduleSummarySegments segments={line.segments} />
        </p>
      ))}
      {breakLines.map((line) => (
        <p key={line.key}>
          <DailyScheduleSummarySegments segments={line.segments} />
        </p>
      ))}
      <p className='RemoteFlows__DailySchedule__Summary__Total'>
        Total of <strong>{totalWeeklyHours} hours</strong> per week
      </p>
    </div>
  );
}
