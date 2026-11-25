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
  Button,
} from '@remoteoss/remote-flows/internals';
import { AlertCircle, CheckIcon, EyeIcon, XIcon } from 'lucide-react';
import { RemoteFlows } from './RemoteFlows';
import { TimeOffDeclineDialog } from './TimeOffDeclineDialog';
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

type RequestDecision = 'approve' | 'decline';

type Decision =
  | RequestDecision
  | 'approve_cancellation'
  | 'decline_cancellation';

const DECISION_LABELS: Record<Decision, string> = {
  approve: 'Approved',
  decline: 'Declined',
  approve_cancellation: 'Cancellation approved',
  decline_cancellation: 'Cancellation declined',
};

const CANCELLATION_DECISIONS: Record<RequestDecision, Decision> = {
  approve: 'approve_cancellation',
  decline: 'decline_cancellation',
};

const isCancellationRequest = (timeOffRequest: TimeOffRequest | undefined) =>
  timeOffRequest?.status === 'cancel_requested';

const canDecide = (timeOffRequest: TimeOffRequest | undefined) =>
  timeOffRequest?.status === 'requested' ||
  isCancellationRequest(timeOffRequest);

const getDecision = (
  decision: RequestDecision,
  timeOffRequest: TimeOffRequest | undefined,
) =>
  isCancellationRequest(timeOffRequest)
    ? CANCELLATION_DECISIONS[decision]
    : decision;

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

  const clearDecision = () => {
    setOutcome(null);
    setDecisionError(null);
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
              ViewButton,
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
            <div className='onboarding-form-container time-off-list-container'>
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
                  {outcome && (
                    <Alert className='mb-4'>
                      <AlertDescription>
                        {DECISION_LABELS[outcome.decision]}. The request is now{' '}
                        {outcome.status}.
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
                  <ListStep
                    renderActions={({ timeOffRequest, canDecide }) => (
                      <>
                        <ViewButton
                          aria-label='View'
                          title='View'
                          onClick={clearDecision}
                        >
                          <EyeIcon />
                        </ViewButton>
                        {canDecide && (
                          <>
                            <TimeOffDeclineDialog
                              DeclineButton={DeclineButton}
                              disabled={timeOffListBag.isSubmitting}
                              isCancellationRequest={isCancellationRequest(
                                timeOffRequest,
                              )}
                              trigger={
                                <Button
                                  type='button'
                                  aria-label={
                                    isCancellationRequest(timeOffRequest)
                                      ? 'Decline cancellation'
                                      : 'Decline'
                                  }
                                  title={
                                    isCancellationRequest(timeOffRequest)
                                      ? 'Decline cancellation'
                                      : 'Decline'
                                  }
                                >
                                  <XIcon />
                                </Button>
                              }
                              onClick={clearDecision}
                              onSuccess={(declinedTimeOffRequest) =>
                                setOutcome({
                                  decision: getDecision(
                                    'decline',
                                    timeOffRequest,
                                  ),
                                  status: declinedTimeOffRequest.status,
                                })
                              }
                              onError={setDecisionError}
                            />
                            <ApproveButton
                              aria-label={
                                isCancellationRequest(timeOffRequest)
                                  ? 'Approve cancellation'
                                  : 'Approve'
                              }
                              title={
                                isCancellationRequest(timeOffRequest)
                                  ? 'Approve cancellation'
                                  : 'Approve'
                              }
                              approverId={null}
                              onClick={clearDecision}
                              onSuccess={(approvedTimeOffRequest) =>
                                setOutcome({
                                  decision: getDecision(
                                    'approve',
                                    timeOffRequest,
                                  ),
                                  status: approvedTimeOffRequest.status,
                                })
                              }
                              onError={setDecisionError}
                            >
                              <CheckIcon />
                            </ApproveButton>
                          </>
                        )}
                      </>
                    )}
                  />
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
                    {canDecide(timeOffListBag.timeOffRequest) && (
                      <div className='buttons-container'>
                        <TimeOffDeclineDialog
                          DeclineButton={DeclineButton}
                          disabled={timeOffListBag.isSubmitting}
                          isCancellationRequest={isCancellationRequest(
                            timeOffListBag.timeOffRequest,
                          )}
                          onClick={() => setDecisionError(null)}
                          onSuccess={(timeOffRequest) =>
                            setOutcome({
                              decision: getDecision(
                                'decline',
                                timeOffListBag.timeOffRequest,
                              ),
                              status: timeOffRequest.status,
                            })
                          }
                          onError={setDecisionError}
                        />
                        <ApproveButton
                          className='submit-button'
                          approverId={null}
                          onClick={() => setDecisionError(null)}
                          onSuccess={(timeOffRequest) =>
                            setOutcome({
                              decision: getDecision(
                                'approve',
                                timeOffListBag.timeOffRequest,
                              ),
                              status: timeOffRequest.status,
                            })
                          }
                          onError={setDecisionError}
                        >
                          {isCancellationRequest(timeOffListBag.timeOffRequest)
                            ? 'Approve cancellation'
                            : 'Approve'}
                        </ApproveButton>
                      </div>
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
