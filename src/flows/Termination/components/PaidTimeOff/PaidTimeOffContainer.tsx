import {
  useBookedTimeoffBeforeAndAfterTerminationQuery,
  usePaidTimeoffBreakdownQuery,
  useSummaryTimeOffDataQuery,
  useTimeOffLeavePoliciesSummaryQuery,
} from '@/src/common/api';
import { PaidTimeOffContainerProps } from '@/src/flows/Termination/components/PaidTimeOff/types';
import { useTerminationContext } from '@/src/flows/Termination/context';
import { useState } from 'react';

export const PaidTimeOffContainer = ({
  proposedTerminationDate,
  employeeName,
  render,
}: PaidTimeOffContainerProps) => {
  const [open, setOpen] = useState(false);
  const { terminationBag } = useTerminationContext();

  const leavePoliciesSummaryQuery = useTimeOffLeavePoliciesSummaryQuery({
    employmentId: terminationBag.employmentId,
  });

  const formattedProposedTerminationDate = new Date(
    proposedTerminationDate,
  ).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const timeoffQuery = usePaidTimeoffBreakdownQuery({
    employmentId: terminationBag.employmentId,
    options: {
      enabled: open,
    },
  });

  const bookedTimeBeforeAndAfterTerminationQuery =
    useBookedTimeoffBeforeAndAfterTerminationQuery({
      employmentId: terminationBag.employmentId,
      date: proposedTerminationDate,
    });

  const summaryData = useSummaryTimeOffDataQuery({
    employmentId: terminationBag.employmentId,
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
