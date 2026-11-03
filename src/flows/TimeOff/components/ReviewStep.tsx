import { useTimeOffReviewContext } from '@/src/flows/TimeOff/context';
import { TimeOffReviewStepProps } from '@/src/flows/TimeOff/types';
import { getTimeOffRequestDetails } from '@/src/flows/TimeOff/utils';

export function ReviewStep({ render, children }: TimeOffReviewStepProps) {
  const { timeOffBag } = useTimeOffReviewContext();
  const { timeOffRequest } = timeOffBag;

  if (!timeOffRequest) {
    return null;
  }

  const details = getTimeOffRequestDetails(timeOffRequest);

  return (
    <div
      className={`RemoteFlows__ReviewStep RemoteFlows__ReviewStep--${timeOffRequest.status}`}
    >
      {render ? (
        render({ timeOffRequest, details })
      ) : (
        <dl className='RemoteFlows__ReviewStep__Details'>
          {details.map((detail) => (
            <div
              key={detail.name}
              className={`RemoteFlows__ReviewStep__Item RemoteFlows__ReviewStep__Item__${detail.name}`}
            >
              <dt className='RemoteFlows__ReviewStep__Label'>{detail.label}</dt>
              <dd className='RemoteFlows__ReviewStep__Value'>{detail.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </div>
  );
}
