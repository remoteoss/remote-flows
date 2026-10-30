import { useState } from 'react';
import {
  TimeOffDecisionError,
  TimeOffListFlow,
  TimeOffRequest,
  TimeOffRequestError,
  TimeOffRequestsError,
} from '@remoteoss/remote-flows';
import {
  Alert,
  AlertDescription,
  Input,
  Label,
} from '@remoteoss/remote-flows/internals';
import { AlertCircle } from 'lucide-react';
import { RemoteFlows } from './RemoteFlows';
import './css/main.css';

const LIST_ERROR_MESSAGES: Record<TimeOffRequestsError['reason'], string> = {
  unauthorized: 'You are not allowed to list time-off requests.',
  rejected: 'The time-off requests could not be listed with these filters.',
  request_failed: 'The time-off requests could not be loaded.',
};

const REQUEST_ERROR_MESSAGES: Record<TimeOffRequestError['reason'], string> = {
  not_found:
    'This time-off request does not exist or is not available to your company.',
  unauthorized: 'You are not allowed to review this time-off request.',
  request_failed: 'The time-off request could not be loaded.',
};

type Decision = 'approve' | 'decline';

const DECISION_LABELS: Record<Decision, string> = {
  approve: 'Approved',
  decline: 'Declined',
};

const getDecisionErrorMessage = (error: TimeOffDecisionError) =>
  error.reason === 'rejected'
    ? error.fieldErrors.map((fieldError) => fieldError.message).join(' ') ||
      error.message
    : error.message;

export function TimeOffList() {
  const [outcome, setOutcome] = useState<{
    decision: Decision;
    status: TimeOffRequest['status'];
  } | null>(null);
  const [decisionError, setDecisionError] =
    useState<TimeOffDecisionError | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const clearDecision = () => {
    setOutcome(null);
    setDecisionError(null);
    setDeclineReason('');
  };

  return (
    <RemoteFlows proxy={{ url: window.location.origin }}>
      <div style={{ width: 640, padding: 20, margin: '80px auto' }}>
        <TimeOffListFlow
          render={({
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
          }) => (
            <div className='onboarding-form-container'>
              <h2 className='text-lg font-semibold mb-4'>Time-off requests</h2>
              {timeOffListBag.stepState.currentStep.name === 'list' && (
                <>
                  <StatusFilter />
                  {timeOffListBag.isLoadingTimeOffRequests && (
                    <p>Loading time-off requests...</p>
                  )}
                  {timeOffListBag.timeOffRequestsError && (
                    <Alert variant='destructive' className='mb-4'>
                      <AlertCircle />
                      <AlertDescription>
                        {
                          LIST_ERROR_MESSAGES[
                            timeOffListBag.timeOffRequestsError.reason
                          ]
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                  {timeOffListBag.isEmpty && (
                    <p>No time-off requests with this status.</p>
                  )}
                  <ListStep />
                  <div className='buttons-container'>
                    {timeOffListBag.timeOffRequestsError ? (
                      <ListRetryButton className='submit-button'>
                        Try again
                      </ListRetryButton>
                    ) : (
                      timeOffListBag.totalPages !== undefined &&
                      timeOffListBag.totalPages > 1 && (
                        <>
                          <PreviousPageButton className='back-button'>
                            Previous
                          </PreviousPageButton>
                          <span>
                            Page {timeOffListBag.currentPage} of{' '}
                            {timeOffListBag.totalPages}
                          </span>
                          <NextPageButton className='back-button'>
                            Next
                          </NextPageButton>
                        </>
                      )
                    )}
                  </div>
                </>
              )}
              {timeOffListBag.stepState.currentStep.name === 'review' && (
                <>
                  {timeOffListBag.isLoading && (
                    <p>Loading time-off request...</p>
                  )}
                  {timeOffListBag.timeOffRequestError && (
                    <Alert variant='destructive' className='mb-4'>
                      <AlertCircle />
                      <AlertDescription>
                        {
                          REQUEST_ERROR_MESSAGES[
                            timeOffListBag.timeOffRequestError.reason
                          ]
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                  <ReviewStep>
                    {outcome && (
                      <Alert className='mb-4'>
                        <AlertDescription>
                          {DECISION_LABELS[outcome.decision]}. The request is
                          now {outcome.status}.
                        </AlertDescription>
                      </Alert>
                    )}
                    {decisionError && (
                      <Alert variant='destructive' className='mb-4'>
                        <AlertCircle />
                        <AlertDescription>
                          {getDecisionErrorMessage(decisionError)}
                        </AlertDescription>
                      </Alert>
                    )}
                    {timeOffListBag.timeOffRequest?.status === 'requested' && (
                      <>
                        <div className='mb-4'>
                          <Label htmlFor='decline-reason' className='mb-2'>
                            Decline reason (optional)
                          </Label>
                          <Input
                            id='decline-reason'
                            value={declineReason}
                            onChange={(event) =>
                              setDeclineReason(event.target.value)
                            }
                          />
                        </div>
                        <div className='buttons-container'>
                          <DeclineButton
                            className='back-button'
                            declineReason={declineReason.trim() || null}
                            onClick={() => setDecisionError(null)}
                            onSuccess={(timeOffRequest) =>
                              setOutcome({
                                decision: 'decline',
                                status: timeOffRequest.status,
                              })
                            }
                            onError={setDecisionError}
                          >
                            Decline
                          </DeclineButton>
                          <ApproveButton
                            className='submit-button'
                            approverId={null}
                            onClick={() => setDecisionError(null)}
                            onSuccess={(timeOffRequest) =>
                              setOutcome({
                                decision: 'approve',
                                status: timeOffRequest.status,
                              })
                            }
                            onError={setDecisionError}
                          >
                            Approve
                          </ApproveButton>
                        </div>
                      </>
                    )}
                  </ReviewStep>
                  <div className='buttons-container'>
                    <BackButton className='back-button' onClick={clearDecision}>
                      Back to the list
                    </BackButton>
                    {timeOffListBag.timeOffRequestError &&
                      timeOffListBag.timeOffRequestError.reason !==
                        'not_found' && (
                        <RetryButton className='submit-button'>
                          Try again
                        </RetryButton>
                      )}
                  </div>
                </>
              )}
            </div>
          )}
        />
      </div>
    </RemoteFlows>
  );
}
