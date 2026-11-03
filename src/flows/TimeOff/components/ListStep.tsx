import { useTimeOffListContext } from '@/src/flows/TimeOff/context';
import {
  TimeOffListStepProps,
  TimeOffRequestDetail,
} from '@/src/flows/TimeOff/types';
import { getTimeOffRequestDetails } from '@/src/flows/TimeOff/utils';

const LISTED_DETAILS: TimeOffRequestDetail['name'][] = [
  'leave_policy',
  'status',
  'start_date',
  'end_date',
  'duration',
];

export function ListStep({ render }: TimeOffListStepProps) {
  const { timeOffListBag } = useTimeOffListContext();
  const { timeOffRequests } = timeOffListBag;

  if (timeOffRequests.length === 0) {
    return null;
  }

  return (
    <ul className='RemoteFlows__ListStep'>
      {timeOffRequests.map((timeOffRequest) => {
        const details = getTimeOffRequestDetails(timeOffRequest);
        return (
          <li
            key={timeOffRequest.id}
            className={`RemoteFlows__ListStep__Item RemoteFlows__ListStep__Item--${timeOffRequest.status}`}
          >
            <button
              type='button'
              className='RemoteFlows__ListStep__SelectButton'
              onClick={() =>
                timeOffListBag.selectTimeOffRequest(timeOffRequest.id)
              }
            >
              {render
                ? render({ timeOffRequest, details })
                : details
                    .filter((detail) => LISTED_DETAILS.includes(detail.name))
                    .map((detail) => (
                      <span
                        key={detail.name}
                        className={`RemoteFlows__ListStep__Value RemoteFlows__ListStep__Value__${detail.name}`}
                      >
                        {detail.value}
                      </span>
                    ))}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
