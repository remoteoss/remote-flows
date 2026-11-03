import { ApproveButton } from '@/src/flows/TimeOff/components/ApproveButton';
import { DeclineButton } from '@/src/flows/TimeOff/components/DeclineButton';
import { ViewButton } from '@/src/flows/TimeOff/components/ViewButton';
import {
  TimeOffReviewContext,
  useTimeOffListContext,
} from '@/src/flows/TimeOff/context';
import {
  TimeOffApproveOptions,
  TimeOffDeclineOptions,
  TimeOffListStepProps,
} from '@/src/flows/TimeOff/types';

export function ListStep({
  render,
  renderActions,
  renderItem,
}: TimeOffListStepProps) {
  const { timeOffListBag } = useTimeOffListContext();

  const rows = timeOffListBag.timeOffListItems.map((item) => ({
    item,
    timeOffBag: {
      ...timeOffListBag,
      timeOffRequest: item.timeOffRequest,
      approve: ({ approverId }: TimeOffApproveOptions) =>
        timeOffListBag.approveTimeOffRequest({
          timeOffId: item.timeOffRequest.id,
          approverId,
        }),
      decline: ({ declineReason }: TimeOffDeclineOptions) =>
        timeOffListBag.declineTimeOffRequest({
          timeOffId: item.timeOffRequest.id,
          declineReason,
        }),
    },
  }));

  if (rows.length === 0) {
    return null;
  }

  if (renderItem) {
    return (
      <>
        {rows.map(({ item, timeOffBag }) => (
          <TimeOffReviewContext.Provider
            key={item.timeOffRequest.id}
            value={{ timeOffBag }}
          >
            {renderItem(item)}
          </TimeOffReviewContext.Provider>
        ))}
      </>
    );
  }

  return (
    <ul className='RemoteFlows__ListStep'>
      {rows.map(({ item, timeOffBag }) => (
        <li
          key={item.timeOffRequest.id}
          className={`RemoteFlows__ListStep__Item RemoteFlows__ListStep__Item--${item.timeOffRequest.status}`}
        >
          <button
            type='button'
            className='RemoteFlows__ListStep__SelectButton'
            onClick={() =>
              timeOffListBag.selectTimeOffRequest(item.timeOffRequest.id)
            }
          >
            {render
              ? render(item)
              : item.listedDetails.map((detail) => (
                  <span
                    key={detail.name}
                    className={`RemoteFlows__ListStep__Value RemoteFlows__ListStep__Value__${detail.name}`}
                  >
                    {detail.value}
                  </span>
                ))}
          </button>
          <TimeOffReviewContext.Provider value={{ timeOffBag }}>
            <div className='RemoteFlows__ListStep__Actions'>
              {renderActions ? (
                renderActions(item)
              ) : (
                <>
                  <ViewButton />
                  {item.canDecide && (
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
      ))}
    </ul>
  );
}
