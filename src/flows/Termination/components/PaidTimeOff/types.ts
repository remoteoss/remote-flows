import { ListLeavePoliciesSummaryResponse } from '@/src/client';
import { PaidTimeoffBreakdownResponse } from '@/src/common/api';
import { UseQueryResult } from '@tanstack/react-query';

export type PaidTimeOffRenderProps = {
  leavePoliciesSummaryQuery: UseQueryResult<
    ListLeavePoliciesSummaryResponse | undefined,
    Error
  >;
  formattedProposedTerminationDate: string;
  employeeName: string;
  proposedTerminationDate: string;
  employmentId: string;
  onOpenChange: () => void;
  open: boolean;
  timeoffQuery: UseQueryResult<PaidTimeoffBreakdownResponse | undefined, Error>;
};

export type PaidTimeOffContainerProps = {
  proposedTerminationDate: string;
  employeeName: string;
  render: (props: PaidTimeOffRenderProps) => React.ReactNode;
};
