import { useId } from 'react';
import { ApproveButton } from '@/src/flows/TimeOff/components/ApproveButton';
import { BackButton } from '@/src/flows/TimeOff/components/BackButton';
import { DeclineButton } from '@/src/flows/TimeOff/components/DeclineButton';
import { NextButton } from '@/src/flows/TimeOff/components/NextButton';
import { RequestIdStep } from '@/src/flows/TimeOff/components/RequestIdStep';
import { RetryButton } from '@/src/flows/TimeOff/components/RetryButton';
import { ReviewStep } from '@/src/flows/TimeOff/components/ReviewStep';
import { TimeOffContext } from '@/src/flows/TimeOff/context';
import { useTimeOff } from '@/src/flows/TimeOff/hooks';
import { TimeOffFlowProps } from '@/src/flows/TimeOff/types';

/**
 * Time-off flow. Compose its steps from `components` in the render prop.
 */
export const TimeOffFlow = ({ timeOffId, render }: TimeOffFlowProps) => {
  const formId = useId();
  const timeOffBag = useTimeOff({ timeOffId });

  return (
    <TimeOffContext.Provider value={{ formId, timeOffBag }}>
      {render({
        timeOffBag,
        components: {
          RequestIdStep,
          NextButton,
          ReviewStep,
          RetryButton,
          BackButton,
          ApproveButton,
          DeclineButton,
        },
      })}
    </TimeOffContext.Provider>
  );
};
