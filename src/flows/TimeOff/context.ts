import { createContext, useContext } from 'react';
import { useTimeOff } from '@/src/flows/TimeOff/hooks';

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
