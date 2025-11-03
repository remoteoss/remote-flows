import {
  useBookedTimeoffBeforeAndAfterTerminationQuery,
  usePaidTimeoffBreakdownQuery,
  useSummaryTimeOffDataQuery,
  useTimeOffLeavePoliciesSummaryQuery,
} from '@/src/common/api';
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

  const summaryData = useSummaryTimeOffDataQuery({
    employmentId: employmentId,
    proposedTerminationDate,
  });

  const onOpenChange = () => {
    setOpen((open) => !open);
  };

  return render({
    leavePoliciesSummaryQuery,
    timeoffQuery,
    bookedTimeBeforeAndAfterTerminationQuery,
    formattedProposedTerminationDate,
    employeeName,
    proposedTerminationDate,
    summaryData,
    open,
    onOpenChange,
  });
};
