import { ApproveButton } from '@/src/flows/TimeOff/components/ApproveButton';
import { DeclineButton } from '@/src/flows/TimeOff/components/DeclineButton';
import { ViewButton } from '@/src/flows/TimeOff/components/ViewButton';
import {
  TimeOffReviewContext,
  useTimeOffListContext,
} from '@/src/flows/TimeOff/context';
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

export function ListStep({ render, renderActions }: TimeOffListStepProps) {
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
            <TimeOffReviewContext.Provider
              value={{
                timeOffBag: {
                  ...timeOffListBag,
                  timeOffRequest,
                  approve: ({ approverId }) =>
                    timeOffListBag.approveTimeOffRequest({
                      timeOffId: timeOffRequest.id,
                      approverId,
                    }),
                  decline: ({ declineReason }) =>
                    timeOffListBag.declineTimeOffRequest({
                      timeOffId: timeOffRequest.id,
                      declineReason,
                    }),
                },
              }}
            >
              <div className='RemoteFlows__ListStep__Actions'>
                {renderActions ? (
                  renderActions({ timeOffRequest, details })
                ) : (
                  <>
                    <ViewButton />
                    {timeOffRequest.status === 'requested' && (
                      <>
                        <DeclineButton
                          declineReason={null}
                          className='RemoteFlows__ListStep__DeclineButton'
                        />
                        <ApproveButton
                          approverId={null}
                          className='RemoteFlows__ListStep__ApproveButton'
                        />
                      </>
                    )}
                  </>
                )}
              </div>
            </TimeOffReviewContext.Provider>
          </li>
        );
      })}
    </ul>
  );
}
