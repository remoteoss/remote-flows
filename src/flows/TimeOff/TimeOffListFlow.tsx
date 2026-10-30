import { ApproveButton } from '@/src/flows/TimeOff/components/ApproveButton';
import { BackButton } from '@/src/flows/TimeOff/components/BackButton';
import { DeclineButton } from '@/src/flows/TimeOff/components/DeclineButton';
import { ListRetryButton } from '@/src/flows/TimeOff/components/ListRetryButton';
import { ListStep } from '@/src/flows/TimeOff/components/ListStep';
import { NextPageButton } from '@/src/flows/TimeOff/components/NextPageButton';
import { PreviousPageButton } from '@/src/flows/TimeOff/components/PreviousPageButton';
import { RetryButton } from '@/src/flows/TimeOff/components/RetryButton';
import { ReviewStep } from '@/src/flows/TimeOff/components/ReviewStep';
import { StatusFilter } from '@/src/flows/TimeOff/components/StatusFilter';
import {
  TimeOffListContext,
  TimeOffReviewContext,
} from '@/src/flows/TimeOff/context';
import { useTimeOffList } from '@/src/flows/TimeOff/hooks';
import { TimeOffListFlowProps } from '@/src/flows/TimeOff/types';

/**
 * Time-off list flow. Compose its steps from `components` in the render prop.
 */
export const TimeOffListFlow = ({ pageSize, render }: TimeOffListFlowProps) => {
  const timeOffListBag = useTimeOffList({ pageSize });

  return (
    <TimeOffListContext.Provider value={{ timeOffListBag }}>
      <TimeOffReviewContext.Provider value={{ timeOffBag: timeOffListBag }}>
        {render({
          timeOffListBag,
          components: {
            StatusFilter,
            ListStep,
            ListRetryButton,
            PreviousPageButton,
            NextPageButton,
            ReviewStep,
            RetryButton,
            BackButton,
            ApproveButton,
            DeclineButton,
          },
        })}
      </TimeOffReviewContext.Provider>
    </TimeOffListContext.Provider>
  );
};
