import { L as ListTimeoffResponse, I as TimeoffStatus, J as TimeoffType, K as ListLeavePoliciesSummaryResponse, E as Employment } from './types.gen-CIMOKNAn.js';
import * as _tanstack_react_query from '@tanstack/react-query';
import { UseQueryResult } from '@tanstack/react-query';
import * as _tanstack_query_core from '@tanstack/query-core';
import { BookedTimeoffBeforeDateResponse, SummaryTimeOffDataResponse } from './flows/Termination/api.js';

/**
 * Hook to retrieve time off data for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch time off data for.
 * @param {TimeoffStatus} [params.status] - The status of the time off requests to filter by (e.g., 'approved', 'pending').
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the time off data.
 *
 */
declare const useTimeOffQuery: <TData = ListTimeoffResponse>({ employmentId, status, timeoffType, options, }: {
    employmentId?: string;
    status?: TimeoffStatus;
    timeoffType?: TimeoffType;
    options?: {
        enabled?: boolean;
        select?: (data: ListTimeoffResponse | undefined) => TData;
    };
}) => _tanstack_react_query.UseQueryResult<_tanstack_query_core.NoInfer<TData>, Error>;
type PaidTimeoffBreakdownResponse = {
    bookedDays: number;
    timeoffs: {
        status: string;
        duration: number;
        startDate: string;
        endDate: string;
        formattedDate: string;
    }[];
};
/**
 * Hook to retrieve paid time off breakdown for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch paid time off breakdown for.
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the paid time off breakdown.
 *
 */
declare const usePaidTimeoffBreakdownQuery: ({ employmentId, options, }: {
    employmentId?: string;
    options?: {
        enabled?: boolean;
    };
}) => _tanstack_react_query.UseQueryResult<PaidTimeoffBreakdownResponse, Error>;
/**
 * Hook to retrieve time off balance for a specific employment.
 *
 * @param {Object} params - The parameters for the query.
 * @param {string} [params.employmentId] - The ID of the employment to fetch time off balance for.
 * @returns {UseQueryResult<any, unknown>} - The result of the query, including the time off balance.
 *
 */
declare const useTimeOffLeavePoliciesSummaryQuery: ({ employmentId, }: {
    employmentId?: string;
}) => _tanstack_react_query.UseQueryResult<ListLeavePoliciesSummaryResponse | undefined, Error>;

type PaidTimeOffRenderProps = {
    /**
     * The query result for the leave policies summary.
     * @see {@link useTimeOffLeavePoliciesSummaryQuery}
     */
    leavePoliciesSummaryQuery: UseQueryResult<ListLeavePoliciesSummaryResponse | undefined, Error>;
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
    bookedTimeBeforeAndAfterTerminationQuery: UseQueryResult<BookedTimeoffBeforeDateResponse | undefined, Error>;
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
type PaidTimeOffContainerProps = {
    employment?: Employment;
    employmentId: string;
    proposedTerminationDate: string;
    employeeName: string;
    render: (props: PaidTimeOffRenderProps) => React.ReactNode;
};

export { type PaidTimeOffRenderProps as P, type PaidTimeOffContainerProps as a, usePaidTimeoffBreakdownQuery as b, useTimeOffLeavePoliciesSummaryQuery as c, useTimeOffQuery as u };
