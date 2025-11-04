import { PaidTimeoffBreakdownResponse } from '@/src/common/api';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { Drawer } from '@/src/components/shared/drawer/Drawer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import { UseQueryResult } from '@tanstack/react-query';
import { PaidTimeOffRenderProps } from '@/src/flows/Termination/components/PaidTimeOff/types';
import { getSingularPluralUnit } from '@/src/lib/i18n';

const rowBase =
  'RemoteFlows__SummaryRow flex justify-between items-center py-2 text-xs';
const rowBorder =
  'RemoteFlows__SummaryRowBorder border-b border-b-1 border-b-[#E4E4E7]';

const SummaryRow = ({
  children,
  withBorder = false,
  className = '',
}: {
  children: React.ReactNode;
  withBorder?: boolean;
  className?: string;
}) => {
  return (
    <div className={cn(rowBase, withBorder && rowBorder, className)}>
      {children}
    </div>
  );
};

const SummaryTimeOff = ({
  entitledDays,
  usedDays,
  bookedDays,
  approvedDaysBeforeTermination,
  approvedDaysAfterTermination,
  remainingDays,
  proposedTerminationDate,
}: {
  entitledDays: string;
  usedDays: string;
  bookedDays: string;
  approvedDaysBeforeTermination: string;
  approvedDaysAfterTermination: string;
  remainingDays: string;
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
        <p data-testid='entitled-days' className='font-bold'>
          {entitledDays}
        </p>
      </SummaryRow>
      <SummaryRow>
        <label>Total days booked</label>
        <p data-testid='booked-days' className='font-bold'>
          {bookedDays}
        </p>
      </SummaryRow>
      <SummaryRow>
        <label>Number of days already used</label>
        <p data-testid='used-days' className='font-bold'>
          {usedDays}
        </p>
      </SummaryRow>
      <SummaryRow>
        <label>
          Approved for use before {formattedProposedTerminationDate}
        </label>
        <p data-testid='approved-days-before-termination' className='font-bold'>
          {approvedDaysBeforeTermination}
        </p>
      </SummaryRow>
      <SummaryRow withBorder>
        <label>Approved for use after {formattedProposedTerminationDate}</label>
        <p data-testid='approved-days-after-termination' className='font-bold'>
          {approvedDaysAfterTermination}
        </p>
      </SummaryRow>
      <SummaryRow>
        <label>Total days remaining unused</label>
        <p data-testid='remaining-days' className='font-bold'>
          {remainingDays}
        </p>
      </SummaryRow>
      <SummaryRow className='mb-2 py-0'>
        <p className='text-xs text-[#222E39]'>
          Expiration date of unused days: {formattedProposedTerminationDate}
        </p>
      </SummaryRow>
    </div>
  );
};

const DrawerTimeOff = ({
  employeeName,
  timeoffQuery,
  onOpenChange,
  open,
}: {
  employeeName: string;
  timeoffQuery: UseQueryResult<PaidTimeoffBreakdownResponse | undefined, Error>;
  onOpenChange: () => void;
  open: boolean;
}) => {
  const { data: timeoff } = timeoffQuery || {};
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={`${employeeName} paid time off breakdown`}
      trigger={
        <Button variant='link' className='text-xs text-[#3B82F6] font-bold p-0'>
          See detailed time off breakdown ↗
        </Button>
      }
      className='h-full w-[540px] mt-0 ml-auto px-4 RemoteFlows_DrawerTimeOff'
    >
      <div className='mb-2'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[250px]'>Dates</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeoff?.timeoffs.map((timeoff) => (
              <TableRow key={`${timeoff.startDate}-${timeoff.endDate}`}>
                <TableCell className='font-medium w-[250px]'>
                  {timeoff.formattedDate}
                </TableCell>
                <TableCell>
                  {getSingularPluralUnit({
                    number: timeoff.duration,
                    singular: 'day',
                    plural: 'days',
                  })}
                </TableCell>
                <TableCell>{timeoff.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className='text-xs'>
        Total of{' '}
        {getSingularPluralUnit({
          number: timeoff?.bookedDays,
          singular: 'day',
          plural: 'days',
        })}{' '}
        booked
      </p>
    </Drawer>
  );
};

export type PaidTimeOffProps = PaidTimeOffRenderProps;

/**
 * PaidTimeOff component
 *
 * This component is used to display the paid time off summary and details.
 * It displays the summary data and a button to open the details drawer.
 * When the details drawer is open, it displays the paid time off breakdown.
 */
export const PaidTimeOff = ({
  employeeName,
  proposedTerminationDate,
  summaryData,
  formattedProposedTerminationDate,
  timeoffQuery,
  onOpenChange,
  open,
}: PaidTimeOffProps) => {
  const {
    entitledDays,
    bookedDays,
    usedDays,
    approvedDaysBeforeTermination,
    approvedDaysAfterTermination,
    remainingDays,
  } = summaryData?.data || {
    entitledDays: 0,
    bookedDays: 0,
    usedDays: 0,
    approvedDaysBeforeTermination: 0,
    approvedDaysAfterTermination: 0,
    remainingDays: 0,
  };
  return (
    <div className='RemoteFlows__PaidTimeOff__Container py-3'>
      <h3 className='RemoteFlows__PaidTimeOff__Title mb-2'>Paid time off</h3>
      <p className='RemoteFlows__PaidTimeOff__Description text-sm mb-2'>
        The proposed termination date for {employeeName} is{' '}
        {formattedProposedTerminationDate}. You will need to pay them for any
        unused accrued days. Below is a breakdown of their time off entitlement
        and usage for the current annual leave period:
      </p>
      <div className='mb-2'>
        {!summaryData?.isLoading &&
          !summaryData?.isError &&
          summaryData?.data && (
            <SummaryTimeOff
              entitledDays={entitledDays}
              usedDays={usedDays}
              bookedDays={bookedDays}
              approvedDaysBeforeTermination={approvedDaysBeforeTermination}
              approvedDaysAfterTermination={approvedDaysAfterTermination}
              remainingDays={remainingDays}
              proposedTerminationDate={proposedTerminationDate}
            />
          )}
        <DrawerTimeOff
          employeeName={employeeName}
          timeoffQuery={timeoffQuery}
          onOpenChange={onOpenChange}
          open={open}
        />
      </div>
    </div>
  );
};
