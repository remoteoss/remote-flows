import type {
  Employment,
  ListLeavePoliciesSummaryResponse,
} from '@/src/client';
import type { PaidTimeoffBreakdownResponse } from '@/src/common/api/timeoff';
import type {
  BookedTimeoffBeforeDateResponse,
  SummaryTimeOffDataResponse,
} from '@/src/flows/Termination/api';
import { UseQueryResult } from '@tanstack/react-query';

export type PaidTimeOffRenderProps = {
  /**
   * The query result for the leave policies summary.
   * @see {@link useTimeOffLeavePoliciesSummaryQuery}
   */
  leavePoliciesSummaryQuery: UseQueryResult<
    ListLeavePoliciesSummaryResponse | undefined,
    Error
  >;
  /**
   * The formatted proposed termination date.
   */
  formattedProposedTerminationDate: string;
  /**
   * The name of the employee.
   */
  employeeName: string;
  /**
   * The proposed termination date.
   */
  proposedTerminationDate: string;
  /**
   * The function to open the details drawer.
   */
  onOpenChange: () => void;
  /**
   * Whether the details drawer is open.
   */
  open: boolean;
  /**
   * The query result for the paid time off breakdown.
   * @see {@link usePaidTimeoffBreakdownQuery}
   */
  timeoffQuery: UseQueryResult<PaidTimeoffBreakdownResponse | undefined, Error>;
  /**
   * The query result for the booked time off before and after termination.
   * @see {@link useBookedTimeoffBeforeAndAfterTerminationQuery}
   */
  bookedTimeBeforeAndAfterTerminationQuery: UseQueryResult<
    BookedTimeoffBeforeDateResponse | undefined,
    Error
  >;
  /**
   * The summary data for the paid time off.
   * @see {@link useSummaryTimeOffDataQuery}
   */
  summaryData: {
    data: SummaryTimeOffDataResponse;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
  /**
   * The employment data.
   * @see {@link Employment}
   */
  employment?: Employment;
};

export type PaidTimeOffContainerProps = {
  employment?: Employment;
  employmentId: string;
  proposedTerminationDate: string;
  employeeName: string;
  render: (props: PaidTimeOffRenderProps) => React.ReactNode;
};
