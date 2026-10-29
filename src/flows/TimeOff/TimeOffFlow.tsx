import { useId } from 'react';
import { NextButton } from '@/src/flows/TimeOff/components/NextButton';
import { RequestIdStep } from '@/src/flows/TimeOff/components/RequestIdStep';
import { TimeOffStep } from '@/src/flows/TimeOff/components/TimeOffStep';
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
          TimeOffStep,
        },
      })}
    </TimeOffContext.Provider>
  );
};
