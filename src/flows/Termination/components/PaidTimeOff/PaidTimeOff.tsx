import { PaidTimeoffBreakdownResponse } from '@/src/common/api';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/src/components/ui/drawer';
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

const pluralizeDays = (count: number) =>
  `${count} ${count === 1 ? 'day' : 'days'}`;

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
  entitledDays: number;
  usedDays: number;
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
        <p className='font-bold'>{pluralizeDays(entitledDays)}</p>
      </SummaryRow>
      <SummaryRow>
        <label>Total days booked</label>
        <p className='font-bold'>{pluralizeDays(bookedDays)}</p>
      </SummaryRow>
      <SummaryRow>
        <label>Number of days already used</label>
        <p className='font-bold'>{pluralizeDays(usedDays)}</p>
      </SummaryRow>
      <SummaryRow>
        <label>
          Approved for use before {formattedProposedTerminationDate}
        </label>
        <p className='font-bold'>
          {pluralizeDays(approvedDaysBeforeTermination)}
        </p>
      </SummaryRow>
      <SummaryRow withBorder>
        <label>Approved for use after {formattedProposedTerminationDate}</label>
        <p className='font-bold'>
          {pluralizeDays(approvedDaysAfterTermination)}
        </p>
      </SummaryRow>
      <SummaryRow>
        <label>Total days remaining unused</label>
        <p className='font-bold'>{pluralizeDays(remainingDays)}</p>
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
    <Drawer direction='right' open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button variant='link' className='text-xs text-[#3B82F6] font-bold p-0'>
          See detailed time off breakdown ↗
        </Button>
      </DrawerTrigger>
      <DrawerContent className='h-full w-[540px] mt-0 ml-auto px-4 RemoteFlows_DrawerTimeOff'>
        <div className='h-full flex flex-col'>
          <DrawerHeader>
            <DrawerTitle>{employeeName} paid time off breakdown</DrawerTitle>
          </DrawerHeader>
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
                    <TableCell>{pluralizeDays(timeoff.duration)}</TableCell>
                    <TableCell>{timeoff.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className='text-xs'>
            Total of {pluralizeDays(timeoff?.bookedDays || 0)} booked
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

type PaidTimeOffProps = PaidTimeOffRenderProps;

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
  } = summaryData?.data || {};
  return (
    <div className='py-3'>
      <h3 className='RemoteFlows__PaidTimeOffTitle mb-2'>Paid time off</h3>
      <p className='RemoteFlows__PaidTimeOffDescription text-sm mb-2'>
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
              remainingDays={remainingDays < 0 ? 0 : remainingDays}
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
