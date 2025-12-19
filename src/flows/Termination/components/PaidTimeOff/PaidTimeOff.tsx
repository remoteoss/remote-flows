import { PaidTimeoffBreakdownResponse } from '@/src/common/api/timeoff';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { Drawer } from '@/src/components/shared/drawer/Drawer';
import { Table } from '@/src/components/shared/table/Table';
import { UseQueryResult } from '@tanstack/react-query';
import { PaidTimeOffRenderProps } from '@/src/flows/Termination/components/PaidTimeOff/types';
import { getSingularPluralUnit } from '@/src/lib/i18n';
import { ColumnDef } from '@/src/components/shared/table/Table';

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
  usedDays,
  bookedDays,
  approvedDaysBeforeTermination,
  approvedDaysAfterTermination,
  remainingDays,
  proposedTerminationDate,
  isUnlimitedPto,
  currentEntitlementDays,
}: {
  usedDays: string;
  bookedDays: string;
  approvedDaysBeforeTermination: string;
  approvedDaysAfterTermination: string;
  remainingDays: string;
  proposedTerminationDate: string;
  isUnlimitedPto: boolean;
  currentEntitlementDays: string;
}) => {
  const formattedProposedTerminationDate = new Date(
    proposedTerminationDate,
  ).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return (
    <div>
      <SummaryRow withBorder>
        <label>Number of days entitled to per year</label>
        <p data-testid='entitled-days' className='font-bold'>
          {isUnlimitedPto ? 'Unlimited' : currentEntitlementDays}
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
          Unused days expire on {formattedProposedTerminationDate}
        </p>
      </SummaryRow>
    </div>
  );
};

type TimeoffRow = {
  formattedDate: string;
  duration: number;
  status: string;
};

const TIMEOFF_COLUMNS: ColumnDef<TimeoffRow>[] = [
  {
    id: 'formattedDate',
    label: 'Dates',
    className: 'w-[250px]',
    cellClassName: 'font-medium',
  },
  {
    id: 'duration',
    label: 'Duration',
    render: (value: number) =>
      getSingularPluralUnit({
        number: value,
        singular: 'day',
        plural: 'days',
        followCopyGuidelines: false,
        showNumber: true,
      }),
  },
  {
    id: 'status',
    label: 'Status',
  },
];

const DrawerTimeOff = ({
  employeeName,
  timeoffQuery,
  entitledDays,
  countryName,
  currentEntitlementDays,
  formattedProposedTerminationDate,
  onOpenChange,
  open,
}: {
  employeeName: string;
  timeoffQuery: UseQueryResult<PaidTimeoffBreakdownResponse | undefined, Error>;
  entitledDays: string;
  countryName: string;
  currentEntitlementDays: string;
  onOpenChange: () => void;
  open: boolean;
  formattedProposedTerminationDate: string;
}) => {
  const { data: timeoff, isLoading } = timeoffQuery;

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
      {!isLoading && (
        <>
          {Array.isArray(timeoff?.timeoffs) && timeoff?.timeoffs?.length > 0 ? (
            <>
              <p className='text-[#09090B] font-medium mb-4'>
                This list is for your information only.
              </p>
              <p className='text-xs text-[#09090B] mb-1 flex items-center justify-between gap-2'>
                <span>Annual entitlement for {countryName}</span>
                <span className='font-bold'>{entitledDays}</span>
              </p>
              <p className='text-xs text-[#09090B] mb-6 flex items-center justify-between gap-2'>
                <span>
                  Entitlement up to {formattedProposedTerminationDate}
                </span>
                <span className='font-bold'>{currentEntitlementDays}</span>
              </p>
              <div className='mb-2'>
                <Table data={timeoff?.timeoffs} columns={TIMEOFF_COLUMNS} />
              </div>
              <p className='text-xs'>
                Total of{' '}
                {getSingularPluralUnit({
                  number: timeoff?.bookedDays,
                  singular: 'day',
                  plural: 'days',
                  followCopyGuidelines: false,
                  showNumber: true,
                })}{' '}
                booked
              </p>
            </>
          ) : (
            <>
              <p className='font-medium mb-1 text-[#09090B]'>
                No recorded time off
              </p>
              <p className='text-sm text-[#09090B]'>
                According to our records, {employeeName} has not taken any time
                off this year.
              </p>
            </>
          )}
        </>
      )}
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
  employment,
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
    currentEntitlementDays,
    isUnlimitedPto,
  } = summaryData.data;
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
              usedDays={usedDays}
              bookedDays={bookedDays}
              currentEntitlementDays={currentEntitlementDays}
              approvedDaysBeforeTermination={approvedDaysBeforeTermination}
              approvedDaysAfterTermination={approvedDaysAfterTermination}
              remainingDays={remainingDays}
              proposedTerminationDate={proposedTerminationDate}
              isUnlimitedPto={isUnlimitedPto}
            />
          )}
        <DrawerTimeOff
          employeeName={employeeName}
          timeoffQuery={timeoffQuery}
          entitledDays={entitledDays}
          currentEntitlementDays={currentEntitlementDays}
          countryName={employment?.country?.name ?? 'Unknown'}
          onOpenChange={onOpenChange}
          formattedProposedTerminationDate={formattedProposedTerminationDate}
          open={open}
        />
      </div>
    </div>
  );
};
