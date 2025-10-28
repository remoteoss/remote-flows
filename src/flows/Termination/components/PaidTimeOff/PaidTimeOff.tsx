import {
  useTimeOffLeavePoliciesSummaryQuery,
  useTimeOffQuery,
} from '@/src/common/api';
import { useTerminationContext } from '@/src/flows/Termination/context';
import { $TSFixMe } from '@/src/types/remoteFlows';

export const SummaryTimeOff = ({
  entitledDays,
  takenDays,
  bookedDays,
  approvedDaysBeforeTermination,
  approvedDaysAfterTermination,
  remainingDays,
  proposedTerminationDate,
}: {
  entitledDays: number;
  takenDays: number;
  bookedDays: number;
  approvedDaysBeforeTermination: number;
  approvedDaysAfterTermination: number;
  remainingDays: number;
  proposedTerminationDate: string;
}) => {
  const formattedProposedTerminationDate = new Date(
    proposedTerminationDate,
  ).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return (
    <div>
      <div className='flex justify-between items-center py-2 text-xs'>
        <label>Number of days entitled to per year</label>
        <p className='font-bold'>{entitledDays} days</p>
      </div>
      <div className='flex justify-between items-center py-2 text-xs'>
        <label>Total days booked</label>
        <p className='font-bold'>{bookedDays} days</p>
      </div>
      <div className='flex justify-between items-center py-2 text-xs'>
        <label>Number of days already used</label>
        <p className='font-bold'>{takenDays} days</p>
      </div>
      <div className='flex justify-between items-center py-2 text-xs'>
        <label>
          Approved for use before {formattedProposedTerminationDate}
        </label>
        <p className='font-bold'>{approvedDaysBeforeTermination} days</p>
      </div>
      <div className='flex justify-between items-center py-2 text-xs'>
        <label>Approved for use after {formattedProposedTerminationDate}</label>
        <p className='font-bold'>{approvedDaysAfterTermination} days</p>
      </div>
      <div className='flex justify-between items-center py-2 text-xs'>
        <label>Total days remaining unused</label>
        <p className='font-bold'>{remainingDays} days</p>
      </div>
    </div>
  );
};

export const PaidTimeOff = ({
  employeeName,
  proposedTerminationDate,
}: {
  employeeName: string;
  proposedTerminationDate: string;
}) => {
  const { terminationBag } = useTerminationContext();

  const { data: leavePoliciesSummary } = useTimeOffLeavePoliciesSummaryQuery({
    employmentId: terminationBag.employmentId,
  });
  const { data: timeoff } = useTimeOffQuery({
    employmentId: terminationBag.employmentId,
    timeoffType: 'paid_time_off',
  });

  const { data: takenTimeoff } = useTimeOffQuery({
    employmentId: terminationBag.employmentId,
    timeoffType: 'paid_time_off',
    status: 'taken',
  });
  const formattedProposedTerminationDate = new Date(
    proposedTerminationDate,
  ).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return (
    <div>
      <h3>Paid time off</h3>
      <p>
        The proposed termination date for {employeeName} is{' '}
        {formattedProposedTerminationDate}. You will need to pay them for any
        unused accrued days. Below is a breakdown of their time off entitlement
        and usage for the current annual leave period:
      </p>
      {leavePoliciesSummary && (
        <SummaryTimeOff
          entitledDays={
            (leavePoliciesSummary?.data?.[0].annual_entitlement as $TSFixMe)
              .days || 0
          }
          takenDays={takenTimeoff?.data?.total_count || 0}
          bookedDays={timeoff?.data?.total_count || 0}
          approvedDaysBeforeTermination={0}
          approvedDaysAfterTermination={0}
          remainingDays={0}
          proposedTerminationDate={proposedTerminationDate}
        />
      )}
    </div>
  );
};
