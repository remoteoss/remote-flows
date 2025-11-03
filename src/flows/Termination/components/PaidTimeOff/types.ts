import { ListLeavePoliciesSummaryResponse } from '@/src/client';
import {
  BookedTimeoffBeforeDateResponse,
  PaidTimeoffBreakdownResponse,
  SummaryTimeOffDataResponse,
} from '@/src/common/api';
import { UseQueryResult } from '@tanstack/react-query';

export type PaidTimeOffRenderProps = {
  leavePoliciesSummaryQuery: UseQueryResult<
    ListLeavePoliciesSummaryResponse | undefined,
    Error
  >;
  formattedProposedTerminationDate: string;
  employeeName: string;
  proposedTerminationDate: string;
  onOpenChange: () => void;
  open: boolean;
  timeoffQuery: UseQueryResult<PaidTimeoffBreakdownResponse | undefined, Error>;
  bookedTimeBeforeAndAfterTerminationQuery: UseQueryResult<
    BookedTimeoffBeforeDateResponse | undefined,
    Error
  >;
  summaryData: {
    data: SummaryTimeOffDataResponse;
    isLoading: boolean;
    isError: boolean;
  };
};

export type PaidTimeOffContainerProps = {
  employmentId: string;
  proposedTerminationDate: string;
  employeeName: string;
  render: (props: PaidTimeOffRenderProps) => React.ReactNode;
};
