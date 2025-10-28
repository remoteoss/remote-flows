import { useTimeOffLeavePoliciesSummaryQuery } from '@/src/common/api';
import { useTerminationContext } from '@/src/flows/Termination/context';
import { cn } from '@/src/lib/utils';
import { $TSFixMe } from '@/src/types/remoteFlows';

const rowBase =
  'RemoteFlows__SummaryRow flex justify-between items-center py-2 text-xs';
const rowBorder =
  'RemoteFlows__SummaryRowBorder border-b border-b-1 border-b-[#E4E4E7]';

const SummaryRow = ({
  children,
  withBorder = false,
}: {
  children: React.ReactNode;
  withBorder?: boolean;
}) => {
  return <div className={cn(rowBase, withBorder && rowBorder)}>{children}</div>;
};

const SummaryTimeOff = ({
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
      <SummaryRow withBorder>
        <label>Number of days entitled to per year</label>
        <p className='font-bold'>{entitledDays} days</p>
      </SummaryRow>
      <SummaryRow>
        <label>Total days booked</label>
        <p className='font-bold'>{bookedDays} days</p>
      </SummaryRow>
      <SummaryRow>
        <label>Number of days already used</label>
        <p className='font-bold'>{takenDays} days</p>
      </SummaryRow>
      <SummaryRow>
        <label>
          Approved for use before {formattedProposedTerminationDate}
        </label>
        <p className='font-bold'>{approvedDaysBeforeTermination} days</p>
      </SummaryRow>
      <SummaryRow withBorder>
        <label>Approved for use after {formattedProposedTerminationDate}</label>
        <p className='font-bold'>{approvedDaysAfterTermination} days</p>
      </SummaryRow>
      <SummaryRow>
        <label>Total days remaining unused</label>
        <p className='font-bold'>{remainingDays} days</p>
      </SummaryRow>
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

  const formattedProposedTerminationDate = new Date(
    proposedTerminationDate,
  ).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return (
    <div>
      <h3 className='RemoteFlows__PaidTimeOffTitle mb-2'>Paid time off</h3>
      <p className='RemoteFlows__PaidTimeOffDescription text-sm mb-2'>
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
          takenDays={leavePoliciesSummary?.data?.[0].taken.days || 0}
          bookedDays={0}
          approvedDaysBeforeTermination={0}
          approvedDaysAfterTermination={0}
          remainingDays={0}
          proposedTerminationDate={proposedTerminationDate}
        />
      )}
    </div>
  );
};
