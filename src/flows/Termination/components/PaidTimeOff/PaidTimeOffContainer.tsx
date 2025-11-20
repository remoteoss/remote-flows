import {
  usePaidTimeoffBreakdownQuery,
  useTimeOffLeavePoliciesSummaryQuery,
} from '@/src/common/api';
import {
  useBookedTimeoffBeforeAndAfterTerminationQuery,
  useSummaryTimeOffDataQuery,
} from '@/src/flows/Termination/api';
import { PaidTimeOffContainerProps } from '@/src/flows/Termination/components/PaidTimeOff/types';
import { useState } from 'react';

/**
 * PaidTimeOffContainer component
 *
 * This is a container component that manages paid time off (PTO) data retrieval and state
 * for the termination flow. It aggregates multiple time off-related queries and formats
 * the termination date for display.
 *
 */
export const PaidTimeOffContainer = ({
  proposedTerminationDate,
  employeeName,
  employmentId,
  employment,
  render,
}: PaidTimeOffContainerProps) => {
  const [open, setOpen] = useState(false);

  const leavePoliciesSummaryQuery = useTimeOffLeavePoliciesSummaryQuery({
    employmentId: employmentId,
  });

  const formattedProposedTerminationDate = new Date(
    proposedTerminationDate,
  ).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const timeoffQuery = usePaidTimeoffBreakdownQuery({
    employmentId: employmentId,
    options: {
      enabled: open,
    },
  });

  const bookedTimeBeforeAndAfterTerminationQuery =
    useBookedTimeoffBeforeAndAfterTerminationQuery({
      employmentId: employmentId,
      date: proposedTerminationDate,
    });

  // computed summary data
  const summaryData = useSummaryTimeOffDataQuery({
    employmentId: employmentId,
    proposedTerminationDate,
    employment: employment,
  });

  const onOpenChange = () => {
    setOpen((open) => !open);
  };

  return render({
    leavePoliciesSummaryQuery,
    timeoffQuery: timeoffQuery || {
      data: {
        bookedDays: 0,
        timeoffs: [],
      },
    },
    bookedTimeBeforeAndAfterTerminationQuery,
    formattedProposedTerminationDate,
    employeeName,
    proposedTerminationDate,
    summaryData: summaryData ?? {
      data: {
        entitledDays: '0 days',
        bookedDays: '0 days',
        usedDays: '0 days',
        approvedDaysBeforeTermination: '0 days',
        approvedDaysAfterTermination: '0 days',
        remainingDays: '0 days',
        isUnlimitedPto: false,
      },
      isLoading: false,
      isError: false,
      error: null,
    },
    employment: employment,
    open,
    onOpenChange,
  });
};
