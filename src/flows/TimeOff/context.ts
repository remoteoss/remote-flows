import { createContext, useContext } from 'react';
import {
  useTimeOff,
  useTimeOffList,
  useTimeOffRequestReview,
} from '@/src/flows/TimeOff/hooks';

export const TimeOffContext = createContext<{
  formId: string | undefined;
  timeOffBag: ReturnType<typeof useTimeOff> | null;
}>({
  formId: undefined,
  timeOffBag: null,
});

export const useTimeOffContext = () => {
  const context = useContext(TimeOffContext);
  if (!context.formId || !context.timeOffBag) {
    throw new Error('useTimeOffContext must be used within a TimeOffFlow');
  }

  return {
    formId: context.formId,
    timeOffBag: context.timeOffBag,
  } as const;
};

export const TimeOffListContext = createContext<{
  timeOffListBag: ReturnType<typeof useTimeOffList> | null;
}>({
  timeOffListBag: null,
});

export const useTimeOffListContext = () => {
  const context = useContext(TimeOffListContext);
  if (!context.timeOffListBag) {
    throw new Error(
      'useTimeOffListContext must be used within a TimeOffListFlow',
    );
  }

  return {
    timeOffListBag: context.timeOffListBag,
  } as const;
};

type TimeOffReviewBag = ReturnType<typeof useTimeOffRequestReview> & {
  back: () => void;
};

export const TimeOffReviewContext = createContext<{
  timeOffBag: TimeOffReviewBag | null;
}>({
  timeOffBag: null,
});

export const useTimeOffReviewContext = () => {
  const context = useContext(TimeOffReviewContext);
  if (!context.timeOffBag) {
    throw new Error(
      'useTimeOffReviewContext must be used within a TimeOffFlow or a TimeOffListFlow',
    );
  }

  return {
    timeOffBag: context.timeOffBag,
  } as const;
};
